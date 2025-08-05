export default class Personagem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'personagem');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.5);
    this.setCollideWorldBounds(true);

        // 📦 Ajuste da hitbox do personagem
    const frameWidth = 48;
    const frameHeight = 48;
    const hitboxWidth = 20;   // Ajuste conforme o corpo visível do sprite
    const hitboxHeight = 25;  // Ajuste conforme o corpo visível do sprite
    const offsetX = (frameWidth - hitboxWidth) / 2;
    const offsetY = (frameHeight - hitboxHeight) / 2 + 4;

    this.body.setSize(hitboxWidth, hitboxHeight).setOffset(offsetX, offsetY);

    // Sistema de vida
    this.health = 100;          // Pontos de vida do jogador
    this.invencivel = false;    // Breve invencibilidade após levar dano

    this.scene = scene;

    this.scene.anims.create({
      key: 'idle',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'andar_baixo',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 18, end: 23 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'andar_esquerda',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 6, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'andar_direita',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 24, end: 29 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'andar_cima',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 30, end: 35 }),
      frameRate: 10,
      repeat: -1
    });
    this.scene.anims.create({
      key: 'atacar',
      frames: this.scene.anims.generateFrameNumbers('personagem', { start: 42, end: 45 }),
      frameRate: 10,
      repeat: 0
    });

    this.play('idle');
  }

  atualizar(cursors) {
    if (this.estado === 'morto') return; // não faz nada se estiver morto
    if (this.estado === 'empurrado') return;
    
    this.body.setVelocity(0);

    if (this.estado === 'atacando') return;

    if (Phaser.Input.Keyboard.JustDown(cursors.space)) {
        this.estado = 'atacando';
      this.play('atacar', true).once('animationcomplete', () => {
                this.estado = 'idle';
            });
      return;
    }

    if (cursors.left.isDown) {
      this.body.setVelocityX(-100);
      this.play('andar_esquerda', true);
    } else if (cursors.right.isDown) {
      this.body.setVelocityX(100);
      this.play('andar_direita', true);
    } else if (cursors.up.isDown) {
      this.body.setVelocityY(-100);
      this.play('andar_cima', true);
    } else if (cursors.down.isDown) {
      this.body.setVelocityY(100);
      this.play('andar_baixo', true);
    } else {
      this.play('idle', true);
    }
  }

  // ===== Sistema de dano =====
  levarDano(dano = 20) {
    if (this.invencivel || this.estado === 'morto') return;

    this.health -= dano;
    this.invencivel = true;
    this.setTint(0xff0000);

    this.scene.time.addEvent({
      delay: 500,
      callback: () => {
        this.invencivel = false;
        this.clearTint();
      }
    });

    if (this.health <= 0) {
      this.morrer();
    }
  }

  morrer() {
    this.estado = 'morto';
    this.body.setVelocity(0);
    this.play('idle');
    // Poderia tocar animação de morte aqui se existir
  }
} 