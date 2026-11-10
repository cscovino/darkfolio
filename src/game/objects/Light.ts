import {
  LIGHTS,
  TINT_ALPHA,
  TORCH_COLOR,
  TORCH_LOBE_ALPHA,
  TORCH_LOBE_OFFSET,
  TORCH_LOBE_SCALE,
  TORCH_RADIUS,
  TORCH_TINT_ALPHA,
} from '@/data/lights';
import type { LightDef } from '@/data/lights';
import {
  BEDROOM_LAYOUT,
  BEDROOM_ORIGIN,
  LIVING_LAYOUT,
  LIVING_ORIGIN,
  OFFICE_LAYOUT,
  OFFICE_ORIGIN,
  SEAM_STRIPS,
  VEIL_ZONES,
  WORLD_H,
  WORLD_W,
  YARD_RECT,
} from '@/data/rooms';
import { getCurrentRoom } from '@/game/state/currentRoom';
import type { Rect, RoomId, Vec } from '@/systems/currentRoom';
import type { Dir } from '@/systems/doorGlide';
import { brightnessAt, hashSeed } from '@/systems/lightFlicker';
import {
  POOL_RINGS,
  VEIL_ALPHA,
  crossedAxis,
  facingVector,
  regionAlpha,
  seamStripAlpha,
  wallRects,
  wallShadows,
} from '@/systems/lighting';
import type { VeilFade } from '@/systems/lighting';
import Phaser from 'phaser';

const TORCH_KEY = '__TORCH__';
const TORCH_DT_SIZE = 192;
const TORCH_HALF = TORCH_DT_SIZE / 2;

function basePoolKey(radius: number): string {
  return `__POOL_${radius}__`;
}

const TORCH_BASE_KEY = basePoolKey(TORCH_RADIUS);

const WORLD_WALLS: Rect[] = [
  ...wallRects(LIVING_LAYOUT, LIVING_ORIGIN),
  ...wallRects(OFFICE_LAYOUT, OFFICE_ORIGIN),
  ...wallRects(BEDROOM_LAYOUT, BEDROOM_ORIGIN),
];

export function ensurePoolTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
): void {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  for (const ring of POOL_RINGS) {
    g.fillStyle(0xffffff, ring.alpha);
    g.fillCircle(radius, radius, ring.frac * radius);
  }
  g.generateTexture(key, 2 * radius, 2 * radius);
  g.destroy();
}

export function poolTextureKey(id: string): string {
  return `pool-${id}`;
}

export function bakePool(scene: Phaser.Scene, light: LightDef): string {
  const baseKey = basePoolKey(light.radius);
  ensurePoolTexture(scene, baseKey, light.radius);
  const key = poolTextureKey(light.id);
  if (scene.textures.exists(key)) return key;

  const poolDT = scene.textures.addDynamicTexture(
    key,
    light.radius * 2,
    light.radius * 2,
  );
  if (!poolDT) return key;

  poolDT.stamp(baseKey, undefined, light.radius, light.radius);
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  fillShadowQuads(
    g,
    wallShadows(light, light.radius, WORLD_WALLS),
    light,
    light.radius,
  );
  poolDT.erase(g);
  poolDT.render();
  g.destroy();
  return key;
}

// One accumulated pass + one erase: the texture buffer stores the Graphics
// reference and resolves it at flush, so erasing per quad would replay the
// last accumulated shape once per erase. fillPoints reads x/y immediately and
// keeps no reference, so one reusable polygon serves the whole pass.
const SHADOW_QUAD: Phaser.Math.Vector2[] = Array.from(
  { length: 5 },
  () => new Phaser.Math.Vector2(),
);

function fillShadowQuads(
  gfx: Phaser.GameObjects.Graphics,
  quads: Vec[][],
  origin: Vec,
  half: number,
): void {
  gfx.clear();
  gfx.fillStyle(0xffffff, 1);
  for (const quad of quads) {
    for (let i = 0; i < quad.length; i++) {
      SHADOW_QUAD[i].x = quad[i].x - origin.x + half;
      SHADOW_QUAD[i].y = quad[i].y - origin.y + half;
    }
    gfx.fillPoints(SHADOW_QUAD, true, false, quad.length);
  }
}

export class LightLayer {
  private readonly veil: Phaser.GameObjects.RenderTexture;
  private readonly torchDT: Phaser.Textures.DynamicTexture;
  private readonly shadowGfx: Phaser.GameObjects.Graphics;
  private readonly pools: Array<{
    light: LightDef;
    key: string;
    seed: number;
    tint: Phaser.GameObjects.Image;
  }>;
  private readonly torchTint: Phaser.GameObjects.Image;
  private fade: (VeilFade & { dir: Dir; axis: Vec }) | null = null;

  constructor(scene: Phaser.Scene) {
    ensurePoolTexture(scene, TORCH_BASE_KEY, TORCH_RADIUS);

    const existing = scene.textures.exists(TORCH_KEY)
      ? (scene.textures.get(TORCH_KEY) as Phaser.Textures.DynamicTexture)
      : null;
    const dt =
      existing ??
      scene.textures.addDynamicTexture(TORCH_KEY, TORCH_DT_SIZE, TORCH_DT_SIZE);
    if (dt === null) throw new Error('__TORCH__ DynamicTexture unavailable');
    this.torchDT = dt;

    this.veil = scene.add
      .renderTexture(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H)
      .setDepth(20);
    this.shadowGfx = scene.make.graphics({ x: 0, y: 0 }, false);

    this.pools = LIGHTS.map((light) => {
      const key = bakePool(scene, light);
      const tint = scene.add
        .image(light.x, light.y, key)
        .setTint(light.color)
        .setAlpha(TINT_ALPHA)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setDepth(19);
      return { light, key, seed: hashSeed(light.id), tint };
    });
    this.torchTint = scene.add
      .image(0, 0, TORCH_KEY)
      .setTint(TORCH_COLOR)
      .setAlpha(TORCH_TINT_ALPHA)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(19);
  }

  update(elapsed: number, pos: Vec, facing: Dir): void {
    this.torchTint.setPosition(pos.x, pos.y);
    this.rebuildTorch(pos, facing);
    const fade = this.fade;
    if (
      fade &&
      fade.startedAt === null &&
      crossedAxis(fade.dir, pos, fade.axis)
    )
      fade.startedAt = elapsed;
    this.refillVeil(pos, elapsed);
    if (fade && getCurrentRoom() === fade.to) this.fade = null;
  }

  beginFade(to: RoomId, axis: Vec, dir: Dir): void {
    this.fade = { from: getCurrentRoom(), to, dir, axis, startedAt: null };
  }

  destroy(): void {
    for (const entry of this.pools) entry.tint.destroy();
    this.torchTint.destroy();
    this.shadowGfx.destroy();
    this.veil.destroy();
  }

  private rebuildTorch(pos: Vec, facing: Dir): void {
    this.torchDT.clear();
    this.torchDT.stamp(TORCH_BASE_KEY, undefined, TORCH_HALF, TORCH_HALF);
    const v = facingVector(facing);
    this.torchDT.stamp(
      TORCH_BASE_KEY,
      undefined,
      TORCH_HALF + v.x * TORCH_LOBE_OFFSET,
      TORCH_HALF + v.y * TORCH_LOBE_OFFSET,
      { scale: TORCH_LOBE_SCALE, alpha: TORCH_LOBE_ALPHA },
    );
    fillShadowQuads(
      this.shadowGfx,
      wallShadows(pos, TORCH_RADIUS, WORLD_WALLS),
      pos,
      TORCH_HALF,
    );
    this.torchDT.erase(this.shadowGfx);
    this.torchDT.render();
  }

  private refillVeil(pos: Vec, elapsed: number): void {
    const current = getCurrentRoom();
    const fade = this.fade;
    this.veil.clear();
    for (const zone of VEIL_ZONES) {
      this.veil.fill(
        0x000000,
        regionAlpha(fade, elapsed, current, zone.id),
        zone.x,
        zone.y,
        zone.w,
        zone.h,
      );
    }
    for (const strip of SEAM_STRIPS) {
      this.veil.fill(
        0x000000,
        seamStripAlpha(fade, elapsed, current, strip.rooms),
        strip.x,
        strip.y,
        strip.w,
        strip.h,
      );
    }
    this.veil.fill(
      0x000000,
      VEIL_ALPHA,
      YARD_RECT.x,
      YARD_RECT.y,
      YARD_RECT.w,
      YARD_RECT.h,
    );
    for (const entry of this.pools) {
      const brightness = brightnessAt(entry.seed, elapsed, entry.light.kind);
      entry.tint.setAlpha(TINT_ALPHA * brightness);
      this.veil.stamp(entry.key, undefined, entry.light.x, entry.light.y, {
        blendMode: Phaser.BlendModes.ERASE,
        alpha: brightness,
      });
    }
    this.veil.stamp(TORCH_KEY, undefined, pos.x, pos.y, {
      blendMode: Phaser.BlendModes.ERASE,
    });
    this.veil.render();
  }
}
