export default class Golem extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, alvo) {
        super(scene, x, y, 'golem_idle');

        // Propriedades do Golem
        this.health = 200;
        this.speed = 40;
        this.estado = 'idle';
        this.ultimoAtaque = 0;
        this.alvo = alvo; // Referência ao personagem

        // -- Novas propriedades para ataques variáveis --
        this.projectileCooldown = 2000; // ms
        this.lastProjectileTime = 0;
        this.projectiles = scene.physics.add.group();

        // Flag de fase 2 (enfurecido)
        this.enraged = false;

        // ===== Fase Enfurecida ao criar (caso saúde já baixa) =====
        if (this.health <= 100) {
            this.enraged = true;
            this.speed = 60;
            this.projectileCooldown = 1200;
        }

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
        if (this.estado === 'morto' || this.estado === 'atacando') {
            // Quando atacando corpo a corpo ou morto não faz IA adicional
            return;
        }

        const distancia = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
        const agora = this.scene.time.now;
        const podeAtaqueCorpo = (agora - this.ultimoAtaque > 1000);
        const podeProjetil = (agora - this.lastProjectileTime > this.projectileCooldown);

        // Verifica se deve entrar em modo enraivecido
        if (!this.enraged && this.health <= 100) {
            this.enraged = true;
            this.speed = 60;
            this.projectileCooldown = 1200;
        }

        // Mecânica de escolha de ataque
        if (distancia < 40 && podeAtaqueCorpo) {
            this.ultimoAtaque = agora;
            this.setVelocity(0);
            this.ataqueCorpo();
        } else if (distancia < 180 && podeProjetil) {
            this.lastProjectileTime = agora;
            this.shootProjectile(player);
        }

        // Movimento
        // alcance de visão = diagonal da tela em unidades do mundo
        const cam = this.scene.cameras.main;
        const alcanceVisao = Math.hypot(cam.width, cam.height) / cam.zoom;

        if (distancia < alcanceVisao) {
            this.scene.physics.moveToObject(this, player, this.speed);
            this.play('golem_walk', true);
        } else {
            this.setVelocity(0);
            this.play('golem_idle', true);
        }
    }

    // ===== Ataque corpo a corpo original =====
    ataqueCorpo() {
        if (this.estado === 'atacando') return;

        this.estado = 'atacando';
        this.setVelocity(0);

        this.play('golem_attack', true);

        let empurraoFeito = false;

        const onAnimUpdate = (anim, frame) => {
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
        };

        this.on('animationupdate', onAnimUpdate);

        this.once('animationcomplete', () => {
            this.estado = 'idle';
            this.off('animationupdate', onAnimUpdate); // remove somente este listener
        });
    }

    // ===== Manter compatibilidade com código existente =====
    atacar() {
        // Encaminha para o ataque corpo-a-corpo atualizado
        this.ataqueCorpo();
    }

    levarDano(dano = 20) {
        if (this.estado === 'morto') return;

        // Não interrompe se já está atacando: apenas reduz vida
        const estavaAtacando = this.estado === 'atacando';

        this.health -= dano;

        if (this.health <= 0) {
            this.morrer();
            return;
        }

        if (estavaAtacando) {
            // Feedback visual simples sem mudar estado/anim
            this.setTint(0xff0000);
            this.scene.time.delayedCall(150, () => this.clearTint());
            return; // mantém ataque atual
        }

        // Se estava atacando, cancela callbacks para evitar estados travados
        if (this.currentAttackUpdate) {
            this.off('animationupdate', this.currentAttackUpdate);
            this.currentAttackUpdate = null;
        }
        if (this.currentAttackComplete) {
            this.off('animationcomplete-golem_attack', this.currentAttackComplete);
            this.currentAttackComplete = null;
        }

        // Tocamos animação de machucado
        this.estado = 'machucado';
        this.setVelocity(0);
        this.play('golem_hurt', true).once('animationcomplete', () => {
            this.estado = 'idle';
        });
        // Fallback
        this.scene.time.delayedCall(400, () => {
            if (this.estado === 'machucado') {
                this.estado = 'idle';
            }
        });
    }

    morrer() {
        this.estado = 'morto';
        this.setVelocity(0);
        this.play('golem_die', true);
        this.body.enable = false; // desativa colisões
    }

    // ===== Disparo de projétil (pedra) =====
    shootProjectile(alvo) {
        if (this.estado === 'morto') return;

        // Garante textura simples para pedra caso ainda não exista
        if (!this.scene.textures.exists('rock_tex')) {
            const gfx = this.scene.make.graphics({ x: 0, y: 0, add: false });
            gfx.fillStyle(0x996633, 1);
            gfx.fillCircle(8, 8, 8);
            gfx.generateTexture('rock_tex', 16, 16);
            gfx.destroy();
        }

        const rock = this.scene.physics.add.image(this.x, this.y, 'rock_tex');
        rock.setDepth(5);
        rock.setBounce(0);
        rock.setCollideWorldBounds(false);
        rock.body.setCircle(8);
        rock.body.allowGravity = false;

        // Aplica velocidade instantânea em direção ao alvo
        const speed = this.enraged ? 230 : 180;
        this.scene.physics.moveToObject(rock, alvo, speed);

        // Adiciona ao grupo
        this.projectiles.add(rock);

        // Destroi após 3s
        this.scene.time.addEvent({ delay: 3000, callback: () => rock.destroy() });
    }
} 