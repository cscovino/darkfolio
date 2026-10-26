import Phaser from 'phaser';
import type { InteractableDef } from '../data/interactables';

const FONT = 'ui-monospace, "Courier New", monospace';
const BADGE_H = 28;
const KEY_CAP = 16;
export const DIALOG_HIDDEN_Y = 120;

const PLATE = 0x2a2a2a;
const FRAME = 0x4a3729;
const PAPER = 0x8b6f5e;
const AMBER = 0xffa500;

export class InteractionUI {
  readonly dialogBox: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly layer: Phaser.GameObjects.Container;
  private readonly badge: Phaser.GameObjects.Container;
  private readonly badgePlate: Phaser.GameObjects.Graphics;
  private readonly badgeLetter: Phaser.GameObjects.Text;
  private readonly badgeVerb: Phaser.GameObjects.Text;
  private readonly tagText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly endCue: Phaser.GameObjects.Text;
  private bodyFull = '';
  private reveal = -1;
  private badgeId: string | null = null;
  private badgeWidth = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.layer = scene.add.container(0, 0);

    this.badgePlate = scene.add.graphics();
    this.badgeLetter = scene.add.text(14, 14, 'E', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#2a2a2a',
    });
    this.badgeLetter.setOrigin(0.5);
    this.badgeVerb = scene.add.text(26, 14, '', {
      fontFamily: FONT,
      fontSize: '12px',
      color: '#e8dcc8',
    });
    this.badgeVerb.setOrigin(0, 0.5);
    this.badge = scene.add.container(0, 0, [
      this.badgePlate,
      this.badgeLetter,
      this.badgeVerb,
    ]);
    this.badge.setVisible(false);

    const matte = scene.add.graphics();
    matte.fillStyle(PLATE, 1);
    matte.fillRect(96, 344, 448, 120);
    matte.fillStyle(PAPER, 1);
    matte.fillRect(98, 346, 444, 116);
    matte.fillStyle(FRAME, 1);
    matte.fillRect(100, 348, 440, 112);
    this.tagText = scene.add.text(108, 356, '', {
      fontFamily: FONT,
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#ffa500',
    });
    this.bodyText = scene.add.text(108, 378, '', {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#e8dcc8',
      wordWrap: { width: 424 },
    });
    this.endCue = scene.add.text(108, 378, '▼', {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#ffa500',
    });
    this.endCue.setVisible(false);
    this.dialogBox = scene.add.container(0, 0, [
      matte,
      this.tagText,
      this.bodyText,
      this.endCue,
    ]);
    this.dialogBox.setVisible(false);

    this.layer.add([this.badge, this.dialogBox]);

    // Zoom-1 UI camera over the zoom-4 world: it renders only this layer,
    // the main camera renders everything else — the layer split keeps each
    // surface at exactly one scale. Construct this class LAST in create().
    const uiCam = scene.cameras.add(0, 0, 640, 480);
    scene.cameras.main.ignore(this.layer);
    uiCam.ignore(scene.children.list.filter((child) => child !== this.layer));
  }

  showBadge(def: InteractableDef): void {
    if (this.badgeId !== def.id) {
      this.badgeId = def.id;
      this.badgeVerb.setText(def.verb);
      this.badgeWidth = 36 + this.badgeVerb.width;
      this.badgePlate.clear();
      this.badgePlate.fillStyle(FRAME, 1);
      this.badgePlate.fillRect(0, 0, this.badgeWidth, BADGE_H);
      this.badgePlate.fillStyle(PLATE, 1);
      this.badgePlate.fillRect(2, 2, this.badgeWidth - 4, BADGE_H - 4);
      this.badgePlate.fillStyle(AMBER, 1);
      this.badgePlate.fillRect(6, 6, KEY_CAP, KEY_CAP);
    }
    const cam = this.scene.cameras.main;
    const screenX = (def.rect.x + def.rect.w / 2 - cam.worldView.x) * cam.zoom;
    const screenY = (def.rect.y - cam.worldView.y) * cam.zoom;
    this.badge.setPosition(
      screenX - this.badgeWidth / 2,
      screenY - 8 - BADGE_H,
    );
    this.badge.setVisible(true);
  }

  hideBadge(): void {
    this.badgeId = null;
    this.badge.setVisible(false);
  }

  showDialog(tag: string, text: string): void {
    this.tagText.setText(tag);
    this.bodyFull = text;
    this.reveal = 0;
    this.bodyText.setText('');
    this.dialogBox.setPosition(0, DIALOG_HIDDEN_Y);
    this.dialogBox.setVisible(true);
  }

  setReveal(n: number): void {
    // Same-value calls are no-ops: no re-wrap, no redraw thrash per frame.
    if (n === this.reveal) return;
    this.reveal = n;
    this.bodyText.setText(this.bodyFull.slice(0, n));
  }

  // Shown once typing completes on a dialog-only object; anchored inline after
  // the last revealed char (last wrapped line's measured width).
  showEndCue(): void {
    const lines = this.bodyText.getWrappedText();
    const size = Phaser.GameObjects.GetTextSize(
      this.bodyText,
      this.bodyText.getTextMetrics(),
      lines,
    );
    const lastW = size.lineWidths[size.lineWidths.length - 1] ?? 0;
    this.endCue.setPosition(
      this.bodyText.x + lastW + 6,
      this.bodyText.y + (lines.length - 1) * size.lineHeight,
    );
    this.endCue.setVisible(true);
  }

  toggleEndCue(): void {
    this.endCue.setVisible(!this.endCue.visible);
  }

  hideEndCue(): void {
    this.endCue.setVisible(false);
  }

  hideDialog(): void {
    this.hideEndCue();
    this.dialogBox.setVisible(false);
  }
}
