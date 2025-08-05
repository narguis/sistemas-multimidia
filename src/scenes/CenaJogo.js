import Phaser from 'phaser';
import Personagem from '../entities/Personagem.js';
import Golem from '../entities/Golem.js';

export default class CenaJogo extends Phaser.Scene {
  constructor() {
    super('CenaJogo');
  }

  preload() {
    // Tilemap e tileset
    this.load.tilemapTiledJSON('mapa', 'assets/c1.json');
    this.load.image('tileset', 'assets/Dungeon_24x24.png');

    // Spritesheets do personagem
    this.load.spritesheet('personagem', 'assets/player.png', {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Spritesheets do Golem
    this.load.spritesheet('golem_idle', 'assets/Golem_idle.png', {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet('golem_walk', 'assets/Golem_walk.png', {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet('golem_attack', 'assets/Golem_attack.png', {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet('golem_hurt', 'assets/Golem_hurt.png', {
      frameWidth: 90,
      frameHeight: 64,
    });
    this.load.spritesheet('golem_die', 'assets/Golem_die.png', {
      frameWidth: 90,
      frameHeight: 64,
    });
  }

  create() {
    const mapa = this.make.tilemap({ key: 'mapa' });
    const tiles = mapa.addTilesetImage('builder_c1', 'tileset');
    mapa.createLayer('toplayer', tiles);

    // Criação do personagem e do inimigo
    this.personagem = new Personagem(this, 520, 260);
    this.golem = new Golem(this, 220, 260, this.personagem);

    // Controle de tempo para não contar dano múltiplas vezes por golpe
    this.lastPlayerHitTime = 0;

    // Colisão/overlap
    this.physics.add.overlap(
      this.personagem,
      this.golem,
      this.handleOverlap,
      null,
      this,
    );

    // Controles do jogador
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  handleOverlap(personagem, golem) {
    // Se o golem não está atacando, inicia ataque
    if (golem.estado !== 'atacando' && golem.estado !== 'morto') {
      golem.atacar();
    }

    // Se o jogador está atacando, causa dano ao golem uma vez a cada 0.5s
    if (personagem.estado === 'atacando') {
      const agora = this.time.now;
      if (agora - this.lastPlayerHitTime > 500) {
        this.lastPlayerHitTime = agora;
        golem.levarDano(30);
      }
    }
  }

  update() {
    this.personagem.atualizar(this.cursors);
    this.golem.atualizar(this.personagem);
  }
} 