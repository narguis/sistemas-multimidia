import Phaser from 'phaser';
import CenaJogo from './scenes/CenaJogo.js';
import PauseMenu from './scenes/PauseMenu.js';

// Criando a cena do menu principal
class MainMenu extends Phaser.Scene {
  constructor() {
    super('mainMenu');
  }

  preload() {
    // Carregando recursos para o menu
    this.load.image('sky', 'assets/sky.png');
    
    // Tentaremos verificar se as imagens carregaram corretamente
    this.load.on('loaderror', (fileObj) => {
      console.log('Erro ao carregar: ', fileObj.src);
    });
  }

  create() {
    // Obtendo as dimensões atuais do jogo
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Criando um fundo adequado mesmo sem imagens externas
    // Usando um gradiente de cores em vez de depender de imagens
    const background = this.add.graphics();
    background.fillGradientStyle(0x000044, 0x000044, 0x220033, 0x220033, 1);
    background.fillRect(0, 0, width, height);
    
    // Adicionando detalhes ao fundo para dar um tema de dungeon
    for (let i = 0; i < Math.floor(width * height / 10000); i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.7);
      
      // Adicionando pequenas estrelas/poeira para dar atmosfera
      const star = this.add.graphics();
      star.fillStyle(0xaaaaff, alpha);
      star.fillCircle(x, y, size);
    }
    
    // Adicionando alguns padrões de "pedra" para aparência de dungeon
    for (let i = 0; i < Math.floor(width * height / 25000); i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const size = Phaser.Math.Between(30, 80);
      const alpha = Phaser.Math.FloatBetween(0.05, 0.15);
      
      const stone = this.add.graphics();
      stone.fillStyle(0x888888, alpha);
      stone.fillRoundedRect(x, y, size, size, 10);
    }
    
    // Borda decorativa ao redor da tela
    const border = this.add.graphics();
    border.lineStyle(4, 0x994400, 1);
    border.strokeRect(20, 20, width - 40, height - 40);
    
    // Adicionando o título do jogo com estilo mais temático
    const titleText = this.add.text(width / 2, height * 0.2, 'Sistemas Multimídia', {
      fontSize: Math.max(52, Math.floor(width / 15)) + 'px',
      fontFamily: 'Georgia, serif',
      fontWeight: 'bold',
      color: '#ffd700', // Dourado
      stroke: '#8b0000', // Vermelho escuro
      strokeThickness: 8,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#000',
        blur: 5,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    
    // Subtítulo com tema de dungeon crawler
    const subtitleText = this.add.text(width / 2, height * 0.3, 'Aventura nas Masmorras', {
      fontSize: Math.max(24, Math.floor(width / 30)) + 'px',
      fontFamily: 'Georgia, serif',
      fontStyle: 'italic',
      color: '#c0c0c0', // Prateado
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Criando os botões do menu com aparência mais temática
    const buttonWidth = Math.min(400, width * 0.4);
    const buttonHeight = Math.min(60, height * 0.07);
    const createDungeonButton = (yPercent, text, callback) => {
      const y = height * yPercent;
      
      // Retângulo de fundo para o botão
      const buttonBg = this.add.rectangle(width / 2, y, buttonWidth, buttonHeight, 0x4a0000) // Vermelho escuro
        .setStrokeStyle(2, 0x800000) // Borda mais clara
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          buttonBg.fillColor = 0x800000; // Vermelho mais claro no hover
          buttonText.setTint(0xffffff);
          // Sem tentar reproduzir som para não dar erro
        })
        .on('pointerout', () => {
          buttonBg.fillColor = 0x4a0000; // Retorna à cor original
          buttonText.clearTint();
        })
        .on('pointerdown', () => {
          callback.call(this);
        });

      // Cálculo do tamanho da fonte mais equilibrado
      const fontSize = Math.min(28, Math.max(18, Math.floor(width / 40)));
      
      // Texto do botão com tamanho de fonte ajustado
      const buttonText = this.add.text(width / 2, y, text, {
        fontSize: fontSize + 'px',
        fontFamily: 'Georgia, serif',
        fontWeight: 'bold',
        color: '#ffd700', // Dourado
        align: 'center'
      }).setOrigin(0.5);

      // Calculando tamanho proporcional para ícones
      const iconSize = Math.min(24, Math.max(16, Math.floor(width / 45)));
      
      // Ícones temáticos ao lado dos botões como texto simples
      // Posicionando melhor os ícones
      const iconX = width / 2 - buttonWidth / 2 + buttonHeight * 0.7;
      
      if (text === 'Novo Jogo') {
        this.add.text(iconX, y, '⚔️', { 
          fontSize: iconSize + 'px' 
        }).setOrigin(0.5);
      } else if (text === 'Continuar') {
        this.add.text(iconX, y, '📜', { 
          fontSize: iconSize + 'px' 
        }).setOrigin(0.5);
      } else if (text === 'Configurações') {
        this.add.text(iconX, y, '⚙️', { 
          fontSize: iconSize + 'px' 
        }).setOrigin(0.5);
      }

      return { bg: buttonBg, text: buttonText };
    };

    // Criando os botões
    const buttonNewGame = createDungeonButton(0.45, 'Novo Jogo', this.startNewGame);
    const buttonContinue = createDungeonButton(0.55, 'Continuar', this.continueGame);
    const buttonSettings = createDungeonButton(0.65, 'Configurações', this.openSettings);

    // Adicionando animação suave para os botões
    this.tweens.add({
      targets: [buttonNewGame.bg, buttonNewGame.text],
      y: '+=5',
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Versão do jogo no canto inferior
    this.add.text(width - 20, height - 20, 'v0.1 Alpha', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#888',
      align: 'right'
    }).setOrigin(1, 1);
  }

  startNewGame() {
    console.log('Iniciando novo jogo...');
    
    // Fade out antes de iniciar o jogo
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      // Iniciar a cena de jogo
      this.scene.start('gameScene');
    });
  }

  continueGame() {
    console.log('Continuando jogo...');
    
    // Verificar se existe um jogo salvo
    const savedGame = localStorage.getItem('dungeonCrawlerSave');
    
    if (savedGame) {
      // Fade out antes de continuar o jogo
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        // Carregar os dados salvos
        const gameData = JSON.parse(savedGame);
        this.scene.start('gameScene', { savedData: gameData });
      });
    } else {
      // Mostrar mensagem que não há jogo salvo
      const noSaveMsg = this.add.text(this.scale.width / 2, this.scale.height * 0.8, 'Nenhum jogo salvo encontrado!', {
        fontSize: '20px',
        fontFamily: 'Georgia, serif',
        color: '#ff0000',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5);
      
      // Remover a mensagem após alguns segundos
      this.time.delayedCall(3000, () => {
        noSaveMsg.destroy();
      });
    }
  }

  openSettings() {
    console.log('Abrindo configurações...');
    
    // Aqui você pode criar uma nova cena de configurações ou um modal
    // Por enquanto, vamos apenas mostrar uma mensagem
    const settingsMsg = this.add.text(this.scale.width / 2, this.scale.height * 0.8, 'Menu de configurações em desenvolvimento...', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5);
    
    // Remover a mensagem após alguns segundos
    this.time.delayedCall(3000, () => {
      settingsMsg.destroy();
    });
  }
}

// Classe para a cena do jogo
class GameScene extends Phaser.Scene {
  constructor() {
    super('gameScene');
  }

  init(data) {
    // Receber dados de jogo salvo se estiver continuando
    this.savedData = data && data.savedData ? data.savedData : null;
  }

  preload() {
    // Continuamos tentando carregar a imagem base, mas não dependemos dela
    this.load.image('sky', 'assets/sky.png');
  }

  create() {
    // Obtendo as dimensões atuais do jogo
    const width = this.scale.width;
    const height = this.scale.height;
    
    // Fade in ao iniciar o jogo
    this.cameras.main.fadeIn(1000, 0, 0, 0);
    
    // Criando um fundo básico para a cena de jogo
    const background = this.add.graphics();
    background.fillStyle(0x111122, 1);
    background.fillRect(0, 0, width, height);
    
    // Calculando as dimensões do dungeon baseadas no tamanho da tela
    const margin = Math.min(width, height) * 0.1;
    const dungeonWidth = width - (margin * 2);
    const dungeonHeight = height - (margin * 2);
    
    // Desenhando um chão estilo dungeon
    const floor = this.add.graphics();
    floor.fillStyle(0x222222, 1);
    floor.fillRect(margin, margin, dungeonWidth, dungeonHeight);
    
    // Adicionando alguns elementos visuais básicos para indicar ambiente de dungeon
    const wallThickness = Math.max(10, Math.min(width, height) * 0.03);
    const walls = this.add.graphics();
    walls.fillStyle(0x333333, 1);
    walls.fillRect(margin, margin, dungeonWidth, wallThickness);  // Topo
    walls.fillRect(margin, height - margin - wallThickness, dungeonWidth, wallThickness); // Base
    walls.fillRect(margin, margin + wallThickness, wallThickness, dungeonHeight - (wallThickness * 2));  // Esquerda
    walls.fillRect(width - margin - wallThickness, margin + wallThickness, wallThickness, dungeonHeight - (wallThickness * 2)); // Direita
    
    // Adicionando alguns detalhes ao chão do dungeon
    for (let i = 0; i < Math.floor(dungeonWidth * dungeonHeight / 10000); i++) {
      const x = Phaser.Math.Between(margin + wallThickness, width - margin - wallThickness);
      const y = Phaser.Math.Between(margin + wallThickness, height - margin - wallThickness);
      const size = Phaser.Math.Between(5, 15);
      
      const tile = this.add.graphics();
      const color = Phaser.Math.Between(0, 1) ? 0x2a2a2a : 0x1e1e1e;
      tile.fillStyle(color, 1);
      tile.fillRect(x, y, size, size);
    }
    
    // Placeholder do personagem jogável
    const playerSize = Math.min(width, height) * 0.05;
    const player = this.add.graphics();
    player.fillStyle(0x00aa00, 1);
    player.fillCircle(width / 2, height / 2, playerSize);
    player.lineStyle(2, 0xffffff, 1);
    player.strokeCircle(width / 2, height / 2, playerSize);
    
    // Mensagem temporária
    this.add.text(width / 2, height * 0.25, 'Fase de Dungeon', {
      fontSize: Math.max(32, Math.floor(width / 20)) + 'px',
      fontFamily: 'Georgia, serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // Botão para voltar ao menu principal (para fins de teste)
    const backButton = this.add.rectangle(width / 2, height * 0.85, width * 0.3, height * 0.08, 0x4a0000)
      .setStrokeStyle(2, 0x800000)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on('pointerdown', () => {
        this.scene.start('mainMenu');
      });
      
    this.add.text(width / 2, height * 0.85, 'Voltar ao Menu', {
      fontSize: Math.max(20, Math.floor(width / 35)) + 'px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5);

    // Botão para iniciar a fase real de dungeon
    const dungeonButtonBg = this.add.rectangle(width / 2, height * 0.6, width * 0.3, height * 0.08, 0x004a00)
      .setStrokeStyle(2, 0x008000)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .on('pointerdown', () => {
        this.scene.start('CenaJogo');
      });

    this.add.text(width / 2, height * 0.6, 'Fase de Dungeon', {
      fontSize: Math.max(20, Math.floor(width / 35)) + 'px',
      fontFamily: 'Georgia, serif',
      color: '#ffd700',
    }).setOrigin(0.5);
  }

  update() {
    // Lógica de atualização do jogo
  }
}

// Função para calcular o tamanho do canvas
function getGameSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
}

// Configuração inicial do jogo
const gameSize = getGameSize();
const config = {
  type: Phaser.AUTO,
  width: gameSize.width,
  height: gameSize.height,
  backgroundColor: '#000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainMenu, GameScene, CenaJogo, PauseMenu],
  scale: {
    mode: Phaser.Scale.RESIZE,
    parent: 'phaser-example',
    width: '100%',
    height: '100%'
  }
};

// Criando o jogo
const game = new Phaser.Game(config);

// Ajustar o estilo CSS para o canvas ocupar toda a tela
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas');
  if (canvas) {
    // Aplicar estilo para o canvas
    canvas.style.display = 'block';
    canvas.style.margin = '0';
    canvas.style.padding = '0';
    
    // Aplicar estilo para o corpo da página
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000';
  }
});
