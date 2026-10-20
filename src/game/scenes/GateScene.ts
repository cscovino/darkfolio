import Phaser from 'phaser';

const FONT = 'ui-monospace, "Courier New", monospace';

export class GateScene extends Phaser.Scene {
  constructor() {
    super('GateScene');
  }

  create(): void {
    this.add
      .text(320, 224, 'PRESS ANY KEY', {
        fontFamily: FONT,
        fontSize: '32px',
        fontStyle: 'bold',
        color: '#FFA500',
      })
      .setOrigin(0.5);

    this.add
      .text(320, 256, 'the house is listening', {
        fontFamily: FONT,
        fontSize: '12px',
        color: '#8B6F5E',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown', () => {
      this.scene.start('LivingRoomScene');
    });
  }
}
