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

  // ========= Helpers para barras de vida =========
  createHeroHealthBar() {
    this.heroBar = this.add.graphics();
    this.heroBar.setDepth(10);
    this.updateHeroHealthBar();
  }

  updateHeroHealthBar() {
    const barWidth = 50;
    const barHeight = 6;
    const x = this.personagem.x - barWidth / 2;
    const y = this.personagem.y - 40;

    const pct = Phaser.Math.Clamp(this.personagem.health / 100, 0, 1);

    this.heroBar.clear();
    // fundo
    this.heroBar.fillStyle(0x000000, 0.7);
    this.heroBar.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
    // preenchimento
    this.heroBar.fillStyle(0x00ff00, 1);
    this.heroBar.fillRect(x, y, barWidth * pct, barHeight);
  }

  createGolemHealthBar() {
    const screenWidth = this.scale.width;
    this.golemBarBg = this.add.rectangle(screenWidth / 2, 20, screenWidth * 0.6, 16, 0x000000, 0.7).setOrigin(0.5, 0.5).setDepth(1000).setScrollFactor(0);
    this.golemBarFill = this.add.rectangle(this.golemBarBg.x - this.golemBarBg.width / 2, 20, this.golemBarBg.width, 12, 0xff0000).setOrigin(0, 0.5).setDepth(1001).setScrollFactor(0);
    this.updateGolemHealthBar();
  }

  updateGolemHealthBar() {
    const pct = Phaser.Math.Clamp(this.golem.health / 200, 0, 1);
    this.golemBarFill.width = this.golemBarBg.width * pct;
  }

  // ========= Pausa =========
  setupPauseControls() {
    this.input.keyboard.on('keydown-ESC', () => {
      this.pauseGame();
    });
    this.input.keyboard.on('keydown-P', () => {
      this.pauseGame();
    });
  }

  pauseGame() {
    if (this.scene.isPaused()) return;
    this.scene.pause();
    this.scene.launch('PauseMenu');
  }

  create() {
    const mapa = this.make.tilemap({ key: 'mapa' });
    const tiles = mapa.addTilesetImage('builder_c1', 'tileset');
    const dungeonLayer = mapa.createLayer('toplayer', tiles);

    // Ativar colisão apenas em tiles que têm a propriedade "collides" no Tiled
    dungeonLayer.setCollisionByProperty({ collides: true });

    // ========= Ajuste de câmera para full-screen ========
    const worldWidth = mapa.widthInPixels;
    const worldHeight = mapa.heightInPixels;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // usamos o MAIOR zoom para garantir preenchimento horizontal
    const zoomX = this.scale.width / worldWidth;
    const zoomY = this.scale.height / worldHeight;
    const zoom = Math.max(zoomX, zoomY);
    this.cameras.main.setZoom(zoom);

    // Criação do personagem e do inimigo
    this.personagem = new Personagem(this, 520, 260);
    this.golem = new Golem(this, 220, 260, this.personagem);

    // Colisões com paredes
    this.physics.add.collider(this.personagem, dungeonLayer);
    this.physics.add.collider(this.golem, dungeonLayer);

    // Camera segue o personagem
    this.cameras.main.startFollow(this.personagem, true, 0.08, 0.08);

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

    // Dano de projétil do Golem no jogador
    this.physics.add.overlap(
      this.personagem,
      this.golem.projectiles,
      (player, proj) => {
        player.levarDano(15);
        proj.destroy();
      },
      null,
      this,
    );

    // Controles do jogador
    this.cursors = this.input.keyboard.createCursorKeys();

    // Barras de vida
    this.createHeroHealthBar();
    this.createGolemHealthBar();

    // Pausa
    this.setupPauseControls();
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

    // Atualizar barras de vida e posição
    this.updateHeroHealthBar();
    this.updateGolemHealthBar();

    // Reposiciona barra do golem fixa no topo central
    const cam = this.cameras.main;
    const camZoom = cam.zoom;
    const centerX = cam.scrollX + (this.scale.width * 0.5) / camZoom;
    const topY = cam.scrollY + 20 / camZoom;

    this.golemBarBg.setPosition(centerX, topY);
    this.golemBarFill.setPosition(centerX - this.golemBarBg.width * 0.5, topY);
    // Mantém barra em tamanho real na tela
    this.golemBarBg.setScale(1 / camZoom);
    this.golemBarFill.setScale(1 / camZoom);

    // Verificar morte
    if (!this.heroDead && this.personagem.health <= 0) {
      this.heroDead = true;
      this.gameOver(false);
    }

    if (!this.golemDead && this.golem.health <= 0) {
      this.golemDead = true;
      this.gameOver(true);
    }
  }

  gameOver(playerWon) {
    // Pausamos apenas a física/atualizações automáticas, mantendo o sistema de input ativo
    this.physics.pause();
    const msg = playerWon ? 'Vitória!' : 'Game Over';
    const overlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.7).setScrollFactor(0).setDepth(20);
    const txt = this.add.text(this.scale.width / 2, this.scale.height / 2, msg, {
      fontSize: '48px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

    // Botão voltar ao menu principal
    const btnBg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2 + 80, 220, 60, 0x4a0000).setStrokeStyle(2, 0x800000).setScrollFactor(0).setDepth(20).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
      this.scene.stop('PauseMenu');
      this.scene.stop();
      this.scene.start('mainMenu');
    });
    this.add.text(btnBg.x, btnBg.y, 'Menu Principal', {
      fontSize: '24px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(20);
  }
} 