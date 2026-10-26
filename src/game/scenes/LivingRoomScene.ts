import { INTERACTABLES, type InteractableDef } from '@/data/interactables';
import {
  DOORS,
  LIVING_LAYOUT,
  LIVING_ORIGIN,
  ROOM_ZONES,
  SPAWN_X,
  SPAWN_Y,
  WORLD_H,
  WORLD_W,
  YARD_LAYOUT,
} from '@/data/rooms';
import { getCurrentRoom, setCurrentRoom } from '@/game/state/currentRoom';
import { DIALOG_HIDDEN_Y, InteractionUI } from '@/objects/InteractionUI';
import { Player, ensurePlayerTexture } from '@/objects/Player';
import { buildBedroom } from '@/scenes/BedroomScene';
import { buildOffice } from '@/scenes/OfficeScene';
import { buildRoom } from '@/scenes/buildRoom';
import { roomAt } from '@/systems/currentRoom';
import type { Rect } from '@/systems/currentRoom';
import {
  AUTO_DISMISS_MS,
  CHAR_MS,
  READ_HOLD_MS,
  SLIDE_IN_MS,
  SLIDE_OUT_MS,
  actionDuringTyping,
  revealCount,
  stateAfterTyping,
} from '@/systems/dialog';
import {
  GLIDE_EASE,
  GLIDE_MS,
  glideEnd,
  triggeredSide,
} from '@/systems/doorGlide';
import type { DoorDef, DoorSide } from '@/systems/doorGlide';
import { nearestInRange } from '@/systems/proximity';
import { incrementVisit, variantFor } from '@/systems/variants';
import Phaser from 'phaser';

type InteractionMode =
  | 'idle'
  | 'prompt'
  | 'typing'
  | 'paused'
  | 'handoff'
  | 'overlay';

export class LivingRoomScene extends Phaser.Scene {
  private player!: Player;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private keyE!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;
  private ui!: InteractionUI;
  private gliding = false;
  private mode: InteractionMode = 'idle';
  private activeObject: InteractableDef | null = null;
  private dialogText = '';
  private statusLine = '';
  private typedElapsed = 0;
  private cueTimer: Phaser.Time.TimerEvent | null = null;
  private overlayCloseListener: (() => void) | null = null;

  constructor() {
    super('LivingRoomScene');
  }

  create(): void {
    setCurrentRoom('living');

    this.solids = this.physics.add.staticGroup();
    this.drawYard();
    buildRoom(this, this.solids, LIVING_LAYOUT, LIVING_ORIGIN);
    buildOffice(this, this.solids);
    buildBedroom(this, this.solids);

    ensurePlayerTexture(this);
    this.player = new Player(this, SPAWN_X, SPAWN_Y);
    this.physics.add.collider(this.player, this.solids);
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.setZoom(4);
    cam.startFollow(this.player, true, 0.05, 0.05);

    const kb = this.input.keyboard as Phaser.Input.Keyboard.KeyboardPlugin;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D') as LivingRoomScene['wasd'];
    this.keyE = kb.addKey('E');
    this.keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Constructed last: the UI camera ignores every child that exists at
    // construction time, so anything added after it would double-render.
    this.ui = new InteractionUI(this);

    // A shutdown mid-dialog, mid-overlay or mid-glide must not leave a stuck
    // mode, a running timer/tween or a disabled body behind. The window-level
    // close listener would fire into the dead scene later, so it goes too.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cueTimer?.remove(false);
      this.cueTimer = null;
      this.time.removeAllEvents();
      this.tweens.killTweensOf(this.ui.dialogBox);
      this.tweens.killTweensOf(this.player);
      if (this.overlayCloseListener) {
        window.removeEventListener(
          'darkfolio:overlay-close',
          this.overlayCloseListener,
        );
        this.overlayCloseListener = null;
      }
      // Nothing else closes the DOM panel; without this a shutdown mid-overlay
      // leaves it covering the frame.
      const panel = document.getElementById('game-overlay');
      if (panel?.classList.contains('open')) {
        panel.classList.remove('open');
        panel.setAttribute('aria-hidden', 'true');
        panel.blur();
      }
      this.ui.hideDialog();
      this.ui.hideBadge();
      this.activeObject = null;
      this.mode = 'idle';
      this.gliding = false;
      // The display list destroys the player before this handler runs, so the
      // body is only there while the scene is genuinely mid-flow.
      const body = this.player.body as Phaser.Physics.Arcade.Body | undefined;
      if (body) body.enable = true;
    });
  }

  update(_time: number, delta: number): void {
    // JustDown edges kill OS key-repeat (D-29); read before the glide gate so
    // a press during a glide is consumed, not buffered.
    const eDown = Phaser.Input.Keyboard.JustDown(this.keyE);
    const escDown = Phaser.Input.Keyboard.JustDown(this.keyEsc);

    if (this.gliding) return;

    if (this.mode === 'typing') {
      const text = this.dialogText;
      this.typedElapsed += delta;
      this.ui.setReveal(revealCount(this.typedElapsed, text.length));
      const action = actionDuringTyping(eDown, escDown);
      if (action === 'cancel') {
        // Slide out from wherever the box is (kill the in-flight slide-in so
        // the retreat owns y); the paused gate blocks the 200ms so no press
        // re-triggers mid-retreat.
        this.tweens.killTweensOf(this.ui.dialogBox);
        this.mode = 'paused';
        this.dismissPaused();
        return;
      }
      if (action === 'skip' || this.typedElapsed >= text.length * CHAR_MS) {
        this.ui.setReveal(text.length);
        this.finishTyping();
      }
      return;
    }

    // handoff/overlay/paused skip this whole block: no handleInput, no door
    // check, velocity stays zeroed (D-27/D-28).
    if (this.mode === 'idle' || this.mode === 'prompt') {
      const keys = {
        left: this.cursors.left.isDown || this.wasd.A.isDown,
        right: this.cursors.right.isDown || this.wasd.D.isDown,
        up: this.cursors.up.isDown || this.wasd.W.isDown,
        down: this.cursors.down.isDown || this.wasd.S.isDown,
      };
      this.player.handleInput(keys);

      const hit = triggeredSide(
        DOORS,
        { x: this.player.x, y: this.player.y },
        this.player.getFacing(),
        keys,
      );
      if (hit) {
        this.startGlide(hit.door, hit.side);
        return;
      }
      const room = roomAt(ROOM_ZONES, { x: this.player.x, y: this.player.y });
      if (room) setCurrentRoom(room);

      const body: Rect = {
        x: this.player.x - 16,
        y: this.player.y - 16,
        w: 32,
        h: 32,
      };
      const near = nearestInRange(INTERACTABLES, body, getCurrentRoom());
      if (near) {
        this.ui.showBadge(near);
        this.mode = 'prompt';
        if (eDown) this.startInteraction(near);
      } else {
        this.ui.hideBadge();
        this.mode = 'idle';
      }
    }
  }

  private drawYard(): void {
    const g = this.add.graphics();
    const [gx, gy, gw, gh, gc] = YARD_LAYOUT.ground;
    g.fillStyle(gc, 1);
    g.fillRect(gx - gw / 2, gy - gh / 2, gw, gh);
    for (const [x, y, w, h, color] of YARD_LAYOUT.patches) {
      g.fillStyle(color, 1);
      g.fillRect(x - w / 2, y - h / 2, w, h);
    }
    for (const [x, y, w, h, color] of YARD_LAYOUT.props) {
      this.add.rectangle(x, y, w, h, color);
    }
  }

  private startGlide(door: DoorDef, side: DoorSide): void {
    this.gliding = true;
    this.ui.hideBadge();
    this.player.setVelocity(0, 0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.player.setFacing(side.dir);

    const end = glideEnd(door.axis, side.dir);
    this.tweens.add({
      targets: this.player,
      x: end.x,
      y: end.y,
      duration: GLIDE_MS,
      ease: GLIDE_EASE,
      onComplete: () => {
        body.reset(end.x, end.y);
        body.enable = true;
        setCurrentRoom(side.dest);
        this.gliding = false;
      },
    });
  }

  private startInteraction(obj: InteractableDef): void {
    this.activeObject = obj;
    // Exactly one increment per E press, on the press itself (D-19); the same
    // N picks both the dialog variant and the overlay status line (D-18).
    const n = incrementVisit(obj.id);
    this.dialogText = variantFor(n, obj.dialogPool);
    this.statusLine = obj.statusPool ? variantFor(n, obj.statusPool) : '';
    this.mode = 'typing';
    // The box spends the first 250ms rising from below the frame; charging
    // reveal time against that window exposed characters before they were visible.
    this.typedElapsed = -SLIDE_IN_MS;
    this.player.setVelocity(0, 0);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
    this.ui.hideBadge();
    this.ui.showDialog(obj.speakerTag, this.dialogText);
    this.tweens.add({
      targets: this.ui.dialogBox,
      y: 0,
      duration: SLIDE_IN_MS,
      ease: 'Cubic.easeOut',
    });
  }

  private finishTyping(): void {
    if (this.mode !== 'typing' || this.activeObject === null) return;
    const obj = this.activeObject;
    // The slide-in may still be running when the player skips — kill it so
    // the slide-out owns the container's y.
    this.tweens.killTweensOf(this.ui.dialogBox);
    this.mode = stateAfterTyping(obj.overlay !== undefined);

    if (this.mode === 'paused') {
      // Dialog-only beat (D-04): blink the end cue while the pause runs, then
      // slide out on its own — no keypress, no overlay (D-03).
      this.ui.dialogBox.setY(0); // killTweensOf above may have stopped the slide-in short
      this.ui.showEndCue();
      this.cueTimer = this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => this.ui.toggleEndCue(),
      });
      this.time.delayedCall(AUTO_DISMISS_MS, () => this.dismissPaused());
      return;
    }

    // Host beat (D-01): let the completed line settle before it slides away.
    this.ui.dialogBox.setY(0);
    this.time.delayedCall(READ_HOLD_MS, () => this.handoffToOverlay(obj));
  }

  private handoffToOverlay(obj: InteractableDef): void {
    if (this.mode !== 'handoff') return;
    this.tweens.add({
      targets: this.ui.dialogBox,
      y: DIALOG_HIDDEN_Y,
      duration: SLIDE_OUT_MS,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.ui.hideDialog();
        window.dispatchEvent(
          new CustomEvent('darkfolio:overlay', {
            detail: {
              page: obj.overlay ?? '',
              statusLine: this.statusLine,
            },
          }),
        );
        // The panel slides up for SLIDE_IN_MS of CSS; the mode gate swallows
        // every press until it lands (D-29).
        this.time.delayedCall(SLIDE_IN_MS, () => {
          if (this.mode === 'handoff') this.mode = 'overlay';
        });
      },
    });
    this.overlayCloseListener = (): void => {
      this.mode = 'idle';
      this.activeObject = null;
      this.overlayCloseListener = null;
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.enable = true;
    };
    window.addEventListener(
      'darkfolio:overlay-close',
      this.overlayCloseListener,
      { once: true },
    );
  }

  private dismissPaused(): void {
    // Single exit path from 'paused' — kill the blink timer here so a second
    // interaction re-blinks from a clean slate.
    this.cueTimer?.remove(false);
    this.cueTimer = null;
    this.ui.hideEndCue();
    this.tweens.add({
      targets: this.ui.dialogBox,
      y: DIALOG_HIDDEN_Y,
      duration: SLIDE_OUT_MS,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        this.ui.hideDialog();
        this.activeObject = null;
        this.mode = 'idle';
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        body.enable = true;
      },
    });
  }
}
