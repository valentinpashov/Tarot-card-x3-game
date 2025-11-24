import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { GameState, MultiplierData, GameSpeed } from './types';
import { PAY_TABLE, BET_OPTIONS } from './config'; 
import gsap from 'gsap';

// Assets imports...
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
    private cards: Card[] = [];
    private state: GameState = GameState.IDLE;
    private currentSpeed: GameSpeed = GameSpeed.NORMAL;
    private isAutoPlaying: boolean = false;
    
    // Bet
    private currentBetIndex: number = 1;
    
    private uiContainer: PIXI.Container;
    private cardsContainer: PIXI.Container;
    private bgSprite: PIXI.Sprite | null = null;

    // UI elements
    private playButton!: PIXI.Container;
    private payTableButton!: PIXI.Container;
    private speedButton!: PIXI.Container;
    private autoButton!: PIXI.Container;
    private betButton!: PIXI.Container; 
    
    private payTablePopup!: PIXI.Container;
    private resultText!: PIXI.Text;

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
            { alias: 'table', src: tableImg },
            { alias: 'back1', src: back1 }, { alias: 'front1', src: front1 },
            { alias: 'back2', src: back2 }, { alias: 'front2', src: front2 },
            { alias: 'back3', src: back3 }, { alias: 'front3', src: front3 },
        ]);
        
        this.initBackground();
        this.initCards();
        this.initUI();
        this.initPayTablePopup();

        this.resize(this.app.screen.width, this.app.screen.height);
    }

    public resize(width: number, height: number) {
        const centerX = width / 2;
        const centerY = height / 2;
        const isMobile = width < height;

        // Background
        if (this.bgSprite) {
            this.bgSprite.position.set(centerX, centerY);
            const scale = Math.max(width / this.bgSprite.texture.width, height / this.bgSprite.texture.height);
            this.bgSprite.scale.set(scale);
        }

        // Cards 
        const logicalWidth = 1100; 
        let scale = ((width * 0.9) / logicalWidth) * 0.5;
        if (scale > 0.3) scale = 0.3; 
        if (scale < 0.15) scale = 0.15;

        this.cardsContainer.scale.set(scale);
        this.cardsContainer.position.set(centerX, centerY - (isMobile ? 20 : 50));
        const bottomY = height - (isMobile ? 120 : 80);
        
        // PLAY button - center bottom
        if (this.playButton) {
            this.playButton.position.set(centerX, bottomY);
            this.playButton.scale.set(isMobile ? 0.8 : 1);
        }

        const sideOffset = isMobile ? 110 : 180; 

        // BET button - left of Play
        if (this.betButton) {
            this.betButton.position.set(centerX - sideOffset, bottomY);
            this.betButton.scale.set(isMobile ? 0.6 : 0.8);
        }

        // AUTO button - right of Play
        if (this.autoButton) {
            this.autoButton.position.set(centerX + sideOffset, bottomY);
            this.autoButton.scale.set(isMobile ? 0.6 : 0.8);
        }

        // PAY TABLE button - top left
        if (this.payTableButton) {
            this.payTableButton.position.set(isMobile ? 60 : 100, 50);
            this.payTableButton.scale.set(isMobile ? 0.6 : 0.8);
        }

        // SPEED button - top left below PAY
        if (this.speedButton) {
           this.speedButton.position.set(isMobile ? 60 : 100, 130);
            this.speedButton.scale.set(isMobile ? 0.6 : 0.8);
        }

        if (this.resultText) {
            this.resultText.position.set(centerX, centerY + (isMobile ? 60 : 100));
            this.resultText.style.fontSize = isMobile ? 30 : 40;
        }

        if (this.payTablePopup) {
            this.payTablePopup.position.set(centerX, centerY);
            const popupScale = Math.min(1, (width * 0.9) / 400);
            this.payTablePopup.scale.set(popupScale);
        }
    }

    private initBackground() {
        this.bgSprite = PIXI.Sprite.from('table');
        this.bgSprite.anchor.set(0.5);
        this.app.stage.addChildAt(this.bgSprite, 0); 
    }

    private initCards() {
        const gap = 700; 
        for (let i = 0; i < 3; i++) {
            const card = new Card(`back${i+1}`, `front${i+1}`);
            card.x = (i - 1) * gap; 
            card.y = 0;
            if (i === 0) card.rotation = -0.15;
            if (i === 2) card.rotation = 0.15;
            this.cards.push(card);
            this.cardsContainer.addChild(card); 
        }
    }

    private initUI() {
        // PLAY Button
        this.playButton = this.createButton("PLAY", 0xFFD700, 180, 70, 30);
        this.playButton.on('pointerdown', () => {
            if (this.isAutoPlaying) this.toggleAuto();
            else this.startRound();
        });
        this.uiContainer.addChild(this.playButton);

        // BET button 
        const initialBet = BET_OPTIONS[this.currentBetIndex];
        this.betButton = this.createButton(`BET: $${initialBet}`, 0xFFD700, 140, 60, 20); // LightSeaGreen цвят
        this.betButton.on('pointerdown', () => this.cycleBet());
        this.uiContainer.addChild(this.betButton);

        // AUTO button
        this.autoButton = this.createButton("AUTO: OFF", 0xFF6347, 140, 60, 20); 
        this.autoButton.on('pointerdown', () => this.toggleAuto());
        this.uiContainer.addChild(this.autoButton);

        // SPEED button
        this.speedButton = this.createButton("SPEED: 1x", 0xFFD700, 150, 50, 20);
        this.speedButton.on('pointerdown', () => this.cycleSpeed());
        this.uiContainer.addChild(this.speedButton);

        // PAY Button
        this.payTableButton = this.createButton("PAY TABLE", 0xBD9A7A, 150, 50, 20);
        this.payTableButton.on('pointerdown', () => this.togglePayTable());
        this.uiContainer.addChild(this.payTableButton);

        // Result Text
        this.resultText = new PIXI.Text({
            text: "", 
            style: {
                fontSize: 40, fill: 0xFFFFFF, 
                stroke: {color: 0x000000, width: 6 },
                dropShadow: { blur: 4, color: 0x000000, alpha: 0.5, distance: 2 }
            }
        });
        this.resultText.anchor.set(0.5);
        this.uiContainer.addChild(this.resultText);
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
        
        if (this.isAutoPlaying){ 
            this.toggleAuto();
        }

        this.currentBetIndex++;
        if (this.currentBetIndex >= BET_OPTIONS.length) {
            this.currentBetIndex = 0;
        }

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
            const row = new PIXI.Text({ 
                text: `${item.value}x  -  Chance: ${item.chance}%`, 
                style: { fill: 0xFFD700, fontSize: 18 } 
            });
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
        this.payTableButton.visible = false;  // invisible 
        this.speedButton.visible = false;  // invisible
        this.betButton.visible = false;  // invisible
        this.payTablePopup.visible = false;  // invisible
        
        if (!this.isAutoPlaying) {
            this.playButton.visible = false;
        }

        this.resultText.text = "";
        this.cards.forEach(c => c.reset());

        const results = [
            this.getRandomMultiplier(),
            this.getRandomMultiplier(),
            this.getRandomMultiplier()
        ];
        this.cards.forEach((card, i) => card.setOutcome(results[i]));

        this.state = GameState.REVEAL;

        let flipDuration = 0.5;
        let staggerDelay = 300; 

        if (this.currentSpeed === GameSpeed.FAST) {
            flipDuration = 0.25;
            staggerDelay = 150;
        } else if (this.currentSpeed === GameSpeed.INSTANT) {
            flipDuration = 0;
            staggerDelay = 0;
        }

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

        let waitTime = 2000;
        if (this.currentSpeed === GameSpeed.FAST) waitTime = 1500;
        if (this.currentSpeed === GameSpeed.INSTANT) waitTime = 1000;

        setTimeout(() => {
            this.state = GameState.IDLE;
            this.speedButton.visible = true;
            this.payTableButton.visible = true;
            this.betButton.visible = true; 
            
            if (this.isAutoPlaying) {
                this.startRound();
            } else {
                this.playButton.visible = true;
                this.updateButtonText(this.playButton, "PLAY");
            }
        }, waitTime);
    }
}