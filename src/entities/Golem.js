export default class Golem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, alvo) {
        super(scene, x, y, 'golem_idle');

        // Propriedades do Golem
        this.health = 200;
        this.speed = 40;
        this.estado = 'idle';
        this.ultimoAtaque = 0;
        this.alvo = alvo; // Referência ao personagem

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setOrigin(0.5, 0.5);
        this.setCollideWorldBounds(true);

        // 📦 Ajuste da hitbox do Golem
        const golemFrameWidth = 90;
        const golemFrameHeight = 64;
        const golemHitboxWidth = 60;
        const golemHitboxHeight = 45;
        const golemOffsetX = (golemFrameWidth - golemHitboxWidth) / 2;
        const golemOffsetY = (golemFrameHeight - golemHitboxHeight) / 2 + 10;

        this.body.setSize(golemHitboxWidth, golemHitboxHeight).setOffset(golemOffsetX, golemOffsetY);

        this.criarAnimacoes(scene);

        this.play('golem_idle');
    }

    criarAnimacoes(scene) {
        scene.anims.create({
            key: 'golem_idle',
            frames: scene.anims.generateFrameNumbers('golem_idle', { start: 0, end: 7 }),
            frameRate: 5,
            repeat: -1
        });
        scene.anims.create({
            key: 'golem_walk',
            frames: scene.anims.generateFrameNumbers('golem_walk', { start: 0, end: 9 }),
            frameRate: 8,
            repeat: -1
        });
        scene.anims.create({
            key: 'golem_attack',
            frames: scene.anims.generateFrameNumbers('golem_attack', { start: 0, end: 10 }),
            frameRate: 10,
            repeat: 0
        });
        scene.anims.create({
            key: 'golem_hurt',
            frames: scene.anims.generateFrameNumbers('golem_hurt', { start: 0, end: 3 }),
            frameRate: 15,
            repeat: -1
        });
        scene.anims.create({
            key: 'golem_die',
            frames: scene.anims.generateFrameNumbers('golem_die', { start: 0, end: 12 }),
            frameRate: 8,
            repeat: -1
        });
    }

    atualizar(player) {
        if (this.estado === 'morto' || this.estado === 'atacando') return;

        const distancia = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const agora = this.scene.time.now;
        const podeAtacar = (agora - this.ultimoAtaque > 1000);

        if (distancia < 40 && podeAtacar) {
            this.ultimoAtaque = agora;
            this.setVelocity(0);
            this.atacar();
        } else if (distancia < 200) {
            this.scene.physics.moveToObject(this, player, this.speed);
            this.play('golem_walk', true);
        } else {
            this.setVelocity(0);
            this.play('golem_idle', true);
        }
    }

    atacar() {
  if (this.estado === 'atacando') return;

  this.estado = 'atacando';
  this.setVelocity(0);

  this.play('golem_attack', true);

  let empurraoFeito = false;

  this.on('animationupdate', (anim, frame) => {
    if (anim.key === 'golem_attack' && frame.index === 8 && !empurraoFeito) {
      empurraoFeito = true;

      // 💥 EMPURRÃO no frame 6
      if (this.alvo && this.alvo.body) {
        const angulo = Phaser.Math.Angle.Between(this.x, this.y, this.alvo.x, this.alvo.y);
        const forca = 150;

        // Dano ao jogador
        if (this.alvo?.levarDano) {
          this.alvo.levarDano(20);
        }

        this.alvo.estado = 'empurrado';
        this.alvo.body.velocity.x = Math.cos(angulo) * forca;
        this.alvo.body.velocity.y = Math.sin(angulo) * forca;

        this.scene.time.addEvent({
          delay: 150,
          callback: () => {
            this.alvo.estado = 'normal';
            this.alvo.body.setVelocity(0);
          }
        });
      }
    }
  });

  this.once('animationcomplete', () => {
    this.estado = 'idle';
    this.off('animationupdate'); // remove o listener
  });
}



    levarDano(dano = 20) {
        if (this.estado === 'morto') return;

        this.health -= dano;

        if (this.health <= 0) {
            this.morrer();
            return;
        }

        // Tocamos animação de machucado
        this.estado = 'machucado';
        this.setVelocity(0);
        this.play('golem_hurt', true).once('animationcomplete', () => {
            this.estado = 'idle';
        });
    }

    morrer() {
        this.estado = 'morto';
        this.setVelocity(0);
        this.play('golem_die', true);
        this.body.enable = false; // desativa colisões
    }
} 