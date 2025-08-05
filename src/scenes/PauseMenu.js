import Phaser from 'phaser';

export default class PauseMenu extends Phaser.Scene {
  constructor() {
    super('PauseMenu');
  }

  create() {
    const { width, height } = this.scale;

    // Fundo semitransparente
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);

    const title = this.add.text(width / 2, height / 2 - 100, 'Pausado', {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Botão Continuar
    const btnContinueBg = this.add.rectangle(width / 2, height / 2, 240, 60, 0x004a00)
      .setStrokeStyle(2, 0x008000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.stop(); // Fecha PauseMenu
        this.scene.resume('CenaJogo');
      });
    this.add.text(btnContinueBg.x, btnContinueBg.y, 'Continuar', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Botão Menu Principal
    const btnMenuBg = this.add.rectangle(width / 2, height / 2 + 80, 240, 60, 0x4a0000)
      .setStrokeStyle(2, 0x800000)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.scene.stop('CenaJogo');
        this.scene.stop();
        this.scene.start('mainMenu');
      });
    this.add.text(btnMenuBg.x, btnMenuBg.y, 'Menu Principal', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5);
  }
} 