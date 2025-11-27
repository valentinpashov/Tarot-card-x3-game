import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { GameState, MultiplierData, GameSpeed } from './types';
import { PAY_TABLE, BET_OPTIONS } from './config'; 
import gsap from 'gsap';

// @ts-ignore
import bgImg from './assets/background.png'; 
// @ts-ignore
import tableImg from './assets/table.png'; 
// @ts-ignore
import back1 from './assets/back1.png'; 
// @ts-ignore
import front1 from './assets/front1.png';
// @ts-ignore
import back2 from './assets/back2.png';
// @ts-ignore
import front2 from './assets/front2.png';
// @ts-ignore
import back3 from './assets/back3.png';
// @ts-ignore
import front3 from './assets/front3.png';

export class Game {
    private app: PIXI.Application;
    
    private bgSprite: PIXI.Sprite | null = null;
    private tableMesh: PIXI.MeshPlane | null = null;
    
    private cardsContainer: PIXI.Container;
    private cards: Card[] = [];
    
    private uiContainer: PIXI.Container;
    private playButton!: PIXI.Container;
    private payTableButton!: PIXI.Container;
    private speedButton!: PIXI.Container;
    private autoButton!: PIXI.Container;
    private betButton!: PIXI.Container; 
    private payTablePopup!: PIXI.Container;
    private resultText!: PIXI.Text;

    private state: GameState = GameState.IDLE;
    private currentSpeed: GameSpeed = GameSpeed.NORMAL;
    private isAutoPlaying: boolean = false;
    private currentBetIndex: number = 1;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.uiContainer = new PIXI.Container();
        this.cardsContainer = new PIXI.Container();
        
        this.app.stage.addChild(this.cardsContainer);
        this.app.stage.addChild(this.uiContainer);

        this.loadAssets();
    }

    private async loadAssets() {
        await PIXI.Assets.load([
            { alias: 'bg_room', src: bgImg },
            { alias: 'table_mesh', src: tableImg },
            { alias: 'back1', src: back1 }, { alias: 'front1', src: front1 },
            { alias: 'back2', src: back2 }, { alias: 'front2', src: front2 },
            { alias: 'back3', src: back3 }, { alias: 'front3', src: front3 },
        ]);
        
        this.initScene(); 
        this.initCards();
        this.initUI();
        this.initPayTablePopup();

        this.resize(this.app.screen.width, this.app.screen.height);
    }

    private initScene() {
        // 1. Bg
        this.bgSprite = PIXI.Sprite.from('bg_room');
        this.bgSprite.anchor.set(0.5);
        this.app.stage.addChildAt(this.bgSprite, 0); 

        // 2. table
        const tableTex = PIXI.Assets.get('table_mesh');

        if (tableTex.source.style) {
            tableTex.source.style.addressMode = 'clamp-to-edge';
        }
        
        this.tableMesh = new PIXI.MeshPlane({
            texture: tableTex,
            verticesX: 2, 
            verticesY: 2
        });
        
        this.tableMesh.pivot.set(tableTex.width / 2, tableTex.height);
        this.app.stage.addChildAt(this.tableMesh, 1); 
    }

    private applyTablePerspective() {
        if (!this.tableMesh) return;
        
        const buffer = this.tableMesh.geometry.getAttribute('aPosition').buffer;
        const w = this.tableMesh.texture.width;
        
        buffer.data[0] = 0;   // TL x
        buffer.data[2] = w;   // TR x
        
        const perspective = w * 0.12; 
        buffer.data[0] += perspective; 
        buffer.data[2] -= perspective; 
        
        buffer.update();
    }

    public resize(width: number, height: number) {
        const centerX = width / 2;
        const centerY = height / 2;
        const isMobile = width < height;

        // Rеsize bg
        if (this.bgSprite) {
            this.bgSprite.position.set(centerX, centerY);
            const scale = Math.max(width / this.bgSprite.width, height / this.bgSprite.height);
            this.bgSprite.scale.set(scale);
        }

        // Rеsize table
        let tableTopY = centerY; 

        if (this.tableMesh) {
            const baseBottomPos = height + (isMobile ? 120 : 250);
            const shiftUpAmount = height / 5; 
            
            this.tableMesh.position.set(centerX, baseBottomPos - shiftUpAmount);

            let targetWidth = width * 2.17;
            
            let tableScale = targetWidth / this.tableMesh.texture.width;
            tableScale = Math.min(tableScale, 2.2); 
            tableScale = Math.max(tableScale, isMobile ? 0.4 : 0.6);

            this.tableMesh.scale.set(tableScale);
            this.applyTablePerspective();

            tableTopY = this.tableMesh.y - (this.tableMesh.texture.height * tableScale * 0.5);
        }

        // Rеsize cards 
        const logicalWidth = 1100; 
        
        let cardScale = ((width * 0.9) / logicalWidth) * 0.22; 
        
        if (cardScale > 0.23) cardScale = 0.23; 
        if (cardScale < 0.1) cardScale = 0.1; 

        this.cardsContainer.scale.set(cardScale);
        
        const liftCardsUp = isMobile ? 30 : 60;
        this.cardsContainer.position.set(centerX, tableTopY - liftCardsUp + 50);

        this.cards.forEach(card => {
            card.setPerspective(0.12); 
        });

        // UI
        const bottomY = height - (isMobile ? 120 : 80);
        
        if (this.playButton) {
            this.playButton.position.set(centerX, bottomY);
            this.playButton.scale.set(isMobile ? 0.8 : 1);
        }

        const sideOffset = isMobile ? 110 : 180; 
        if (this.betButton) {
            this.betButton.position.set(centerX - sideOffset, bottomY);
            this.betButton.scale.set(isMobile ? 0.6 : 0.8);
        }
        if (this.autoButton) {
            this.autoButton.position.set(centerX + sideOffset, bottomY);
            this.autoButton.scale.set(isMobile ? 0.6 : 0.8);
        }
        if (this.payTableButton) {
            this.payTableButton.position.set(isMobile ? 60 : 100, 50);
            this.payTableButton.scale.set(isMobile ? 0.6 : 0.8);
        }
        if (this.speedButton) {
           this.speedButton.position.set(isMobile ? 60 : 100, 130);
            this.speedButton.scale.set(isMobile ? 0.6 : 0.8);
        }

        // PAYOUT text 
        if (this.resultText) {
            const distAboveCards = (isMobile ? 200 : 350) * cardScale * 2.8;
            const textY = (tableTopY - liftCardsUp) - distAboveCards - 50; 
            
            this.resultText.position.set(centerX, textY); 
            this.resultText.style.fontSize = isMobile ? 40 : 60;
        }

        if (this.payTablePopup) {
            this.payTablePopup.position.set(centerX, centerY);
            const popupScale = Math.min(1, (width * 0.9) / 400);
            this.payTablePopup.scale.set(popupScale);
        }
    }
    
    // Helper methods
    private initCards() {
        const gap = 550; 
        for (let i = 0; i < 3; i++) {
            const card = new Card(`back${i+1}`, `front${i+1}`);
            card.x = (i - 1) * gap; 
            card.y = 0;
            if (i === 0) card.rotation = -0.03;
            if (i === 2) card.rotation = 0.03;
            this.cards.push(card);
            this.cardsContainer.addChild(card); 
        }
    }

    private initUI() {
        this.playButton = this.createButton("PLAY", 0xFFD700, 180, 70, 30);
        this.playButton.on('pointerdown', () => {
            if (this.isAutoPlaying) this.toggleAuto();
            else this.startRound();
        });
        this.uiContainer.addChild(this.playButton);

        const initialBet = BET_OPTIONS[this.currentBetIndex];
        this.betButton = this.createButton(`BET: $${initialBet}`, 0xFFD700, 140, 60, 20); 
        this.betButton.on('pointerdown', () => this.cycleBet());
        this.uiContainer.addChild(this.betButton);

        this.autoButton = this.createButton("AUTO: OFF", 0xFF6347, 140, 60, 20); 
        this.autoButton.on('pointerdown', () => this.toggleAuto());
        this.uiContainer.addChild(this.autoButton);

        this.speedButton = this.createButton("SPEED: 1x", 0xFFD700, 150, 50, 20);
        this.speedButton.on('pointerdown', () => this.cycleSpeed());
        this.uiContainer.addChild(this.speedButton);

        this.payTableButton = this.createButton("PAY TABLE", 0xBD9A7A, 150, 50, 20);
        this.payTableButton.on('pointerdown', () => this.togglePayTable());
        this.uiContainer.addChild(this.payTableButton);

        this.resultText = new PIXI.Text({
            text: "", 
            style: {
                fontSize: 60, fill: 0xFFFFFF, 
                stroke: {color: 0x000000, width: 4 },
                dropShadow: { blur: 2, color: 0x000000, alpha: 0.3, distance: 3 },
                align: 'center'
            }
        });
        this.resultText.anchor.set(0.5);
        this.uiContainer.addChild(this.resultText);
    }
    
    private createButton(label: string, color: number, w=200, h=70, fontSize=30): PIXI.Container {
        const btn = new PIXI.Container();
        const bg = new PIXI.Graphics()
            .roundRect(-w/2, -h/2, w, h, 15)
            .fill(color)
            .stroke({ width: 3, color: 0xFFFFFF });
        
        const txt = new PIXI.Text({ text: label, style: { fontSize, fontWeight: 'bold' } });
        txt.anchor.set(0.5);
        btn.addChild(bg, txt);
        btn.interactive = true;
        btn.cursor = 'pointer';
        return btn;
    }
    
    private updateButtonText(btnContainer: PIXI.Container, text: string, color?: number) {
        const txt = btnContainer.getChildAt(1) as PIXI.Text;
        if (txt) txt.text = text;
        if (color !== undefined) {
            const bg = btnContainer.getChildAt(0) as PIXI.Graphics;
            bg.clear()
              .roundRect(-bg.width/2, -bg.height/2, bg.width, bg.height, 15)
              .fill(color)
              .stroke({ width: 3, color: 0xFFFFFF });
        }
    }

    private cycleBet() {
        if (this.state !== GameState.IDLE && this.state !== GameState.RESULT) return;
        if (this.isAutoPlaying) this.toggleAuto();
        this.currentBetIndex++;
        if (this.currentBetIndex >= BET_OPTIONS.length) this.currentBetIndex = 0;
        const newBet = BET_OPTIONS[this.currentBetIndex];
        this.updateButtonText(this.betButton, `BET: $${newBet}`);
    }

    private cycleSpeed() {
        if (this.state !== GameState.IDLE && this.state !== GameState.RESULT) return;
        if (this.currentSpeed === GameSpeed.NORMAL) {
            this.currentSpeed = GameSpeed.FAST;
            this.updateButtonText(this.speedButton, "SPEED: 2x");
        } else if (this.currentSpeed === GameSpeed.FAST) {
            this.currentSpeed = GameSpeed.INSTANT;
            this.updateButtonText(this.speedButton, "SPEED: MAX");
        } else {
            this.currentSpeed = GameSpeed.NORMAL;
            this.updateButtonText(this.speedButton, "SPEED: 1x");
        }
    }

    private toggleAuto() {
        this.isAutoPlaying = !this.isAutoPlaying;
        if (this.isAutoPlaying) {
            this.updateButtonText(this.autoButton, "AUTO: ON", 0x32CD32);
            this.updateButtonText(this.playButton, "STOP AUTO"); 
            if (this.state === GameState.IDLE) this.startRound();
        } else {
            this.updateButtonText(this.autoButton, "AUTO: OFF", 0xFF6347); 
            this.updateButtonText(this.playButton, "PLAY");
        }
    }
    
    private initPayTablePopup() {
        this.payTablePopup = new PIXI.Container();
        this.payTablePopup.visible = false;
        const bg = new PIXI.Graphics().rect(0, 0, 400, 500).fill({ color: 0x000000, alpha: 0.9 });
        this.payTablePopup.addChild(bg);
        const title = new PIXI.Text({ text: "MULTIPLIERS", style: { fill: 0xFFFFFF, fontSize: 24 } });
        title.position.set(20, 20);
        this.payTablePopup.addChild(title);
        
        let yPos = 70;
        PAY_TABLE.forEach(item => {
            const row = new PIXI.Text({ text: `${item.value}x  -  Chance: ${item.chance}%`, style: { fill: 0xFFD700, fontSize: 18 } });
            row.position.set(20, yPos);
            this.payTablePopup.addChild(row);
            yPos += 30;
        });

        const closeBtn = new PIXI.Text({ text: "X", style: { fill: 0xFF0000, fontSize: 30, fontWeight: 'bold' } });
        closeBtn.position.set(360, 10);
        closeBtn.interactive = true;
        closeBtn.cursor = 'pointer';
        closeBtn.on('pointerdown', () => { this.payTablePopup.visible = false; });
        this.payTablePopup.addChild(closeBtn);
        this.payTablePopup.pivot.set(200, 250); 
        this.uiContainer.addChild(this.payTablePopup);
    }
    private togglePayTable() { this.payTablePopup.visible = !this.payTablePopup.visible; }
    
    private getRandomMultiplier(): MultiplierData {
        const totalWeight = PAY_TABLE.reduce((sum, item) => sum + item.chance, 0);
        let random = Math.random() * totalWeight;
        for (const item of PAY_TABLE) {
            if (random < item.chance) return item;
            random -= item.chance;
        }
        return PAY_TABLE[0];
    }

    private async startRound() {
        if (this.state !== GameState.IDLE) return;
        this.state = GameState.ROUND_START;

        this.uiContainer.children.forEach(c => { 
            if (c === this.resultText) return;

            if (this.isAutoPlaying && (c === this.playButton || c === this.autoButton)) {
                c.visible = true;
                return;
            }
            c.visible = false; 
        }); 

        this.resultText.text = "";
        this.cards.forEach(c => c.reset());

        const results = [ this.getRandomMultiplier(), this.getRandomMultiplier(), this.getRandomMultiplier() ];
        this.cards.forEach((card, i) => card.setOutcome(results[i]));
        this.state = GameState.REVEAL;

        let flipDuration = (this.currentSpeed === GameSpeed.INSTANT) ? 0 : ((this.currentSpeed === GameSpeed.FAST) ? 0.25 : 0.5);
        let staggerDelay = (this.currentSpeed === GameSpeed.INSTANT) ? 0 : ((this.currentSpeed === GameSpeed.FAST) ? 150 : 300);

        for (let i = 0; i < 3; i++) {
            if (staggerDelay > 0) await new Promise(r => setTimeout(r, staggerDelay));
            await this.cards[i].flip(flipDuration);
        }
        this.showResult(results);
    }

    private showResult(results: MultiplierData[]) {
        this.state = GameState.RESULT;
        const totalMultiplier = results.reduce((acc, curr) => acc * curr.value, 1);
        const currentBetAmount = BET_OPTIONS[this.currentBetIndex];
        const payout = currentBetAmount * totalMultiplier;

        this.resultText.text = `Payout: $${payout.toFixed(2)}\n(${totalMultiplier.toFixed(1)}x)`;
        this.resultText.scale.set(0);
        
        const animDuration = (this.currentSpeed === GameSpeed.INSTANT) ? 0.2 : 0.5;
        gsap.to(this.resultText.scale, { x: 1, y: 1, duration: animDuration, ease: "back.out(1.7)" });

        let waitTime = (this.currentSpeed === GameSpeed.INSTANT) ? 500 : ((this.currentSpeed === GameSpeed.FAST) ? 1000 : 1500);

        setTimeout(() => {
            this.state = GameState.IDLE;
            this.uiContainer.children.forEach(c => c.visible = true);
            this.payTablePopup.visible = false; 
            if (this.isAutoPlaying) {
                this.startRound();
            } else {
                this.playButton.visible = true;
                this.updateButtonText(this.playButton, "PLAY");
            }
        }, waitTime);
    }
}