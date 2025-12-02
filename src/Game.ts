import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { GameState, MultiplierData, GameSpeed } from './types';
import { PAY_TABLE, BET_OPTIONS } from './config'; 
import gsap from 'gsap';
import { Camera3d, Container3d, Sprite3d } from 'pixi-projection';

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
// @ts-ignore
import playBtnImg from './assets/playbutton.png';
// @ts-ignore
import stopBtnImg from './assets/stopbutton.png'; 
// @ts-ignore
import autoBtnImg from './assets/autobutton.png';
// @ts-ignore
import betBtnImg from './assets/betbutton.png';
// @ts-ignore
import speedBtnImg from './assets/speedbutton.png';
// @ts-ignore
import payTableBtnImg from './assets/paytablebutton.png';

export class Game {
    private app: PIXI.Application;
    
    private bgSprite: PIXI.Sprite | null = null;
    private camera: Camera3d;
    private world: Container3d; 
    private tableSprite: Sprite3d | null = null;
    private cards: Card[] = [];
    
    private uiContainer: PIXI.Container;
    private playButton!: PIXI.Container;
    private payTableButton!: PIXI.Container;
    private speedButton!: PIXI.Container;
    private autoButton!: PIXI.Container;
    private betButton!: PIXI.Container; 
    
    private payTablePopup!: PIXI.Container;
    private resultText!: PIXI.Text;
    private currentBetText!: PIXI.Text;

    private state: GameState = GameState.IDLE;
    private currentSpeed: GameSpeed = GameSpeed.NORMAL;
    private isAutoPlaying: boolean = false;
    private currentBetIndex: number = 1;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.uiContainer = new PIXI.Container();
        
        // camera settings
        this.camera = new Camera3d();
        this.camera.setPlanes(400, 10, 10000); 
        this.camera.position.set(app.screen.width / 2, app.screen.height / 2);
        this.camera.sortableChildren = true; 
       
        this.world = new Container3d();
        this.camera.addChild(this.world);

        this.app.stage.addChild(this.camera);
        this.app.stage.addChild(this.uiContainer);

        this.app.ticker.add((delta) => {
            this.cards.forEach(card => card.update(delta));
            this.world.children.sort((a: any, b: any) => b.getDepth() - a.getDepth());
        });

        this.loadAssets();
    }

    private async loadAssets() {
        await PIXI.Assets.load([
            { alias: 'bg_room', src: bgImg },
            { alias: 'table_mesh', src: tableImg },
            { alias: 'back1', src: back1 }, { alias: 'front1', src: front1 },
            { alias: 'back2', src: back2 }, { alias: 'front2', src: front2 },
            { alias: 'back3', src: back3 }, { alias: 'front3', src: front3 },
            { alias: 'btn_play', src: playBtnImg },
            { alias: 'btn_stop', src: stopBtnImg },
            { alias: 'btn_auto', src: autoBtnImg },
            { alias: 'btn_bet', src: betBtnImg },
            { alias: 'btn_speed', src: speedBtnImg },
            { alias: 'btn_paytable', src: payTableBtnImg },
        ]);
        
        this.initScene(); 
        this.initCards();
        this.initUI();
        this.initPayTablePopup();

        this.resize(this.app.screen.width, this.app.screen.height);
    }

    private initScene() {
        this.bgSprite = PIXI.Sprite.from('bg_room');
        this.bgSprite.anchor.set(0.5);
        this.app.stage.addChildAt(this.bgSprite, 0);
 
        const tableTex = PIXI.Assets.get('table_mesh');
        this.tableSprite = new Sprite3d(tableTex);
        this.tableSprite.anchor.set(0.5, 0.5); 
        this.tableSprite.euler.x = -Math.PI / 6.0; 
        
        this.world.addChild(this.tableSprite); 
    }

    public resize(width: number, height: number) {
        const centerX = width / 2;
        const centerY = height / 2;
        const isMobile = width < height;

        // Background
        if (this.bgSprite) {
            this.bgSprite.position.set(centerX, centerY);
            const scale = Math.max(width / this.bgSprite.width, height / this.bgSprite.height);
            this.bgSprite.scale.set(scale);
        }

        this.camera.position.set(centerX, centerY);

        // Table settings
        if (this.tableSprite) {
            const tableScale = isMobile ? 1.8 : 5.2; 
            
            this.tableSprite.scale3d.x = tableScale;
            this.tableSprite.scale3d.y = tableScale;
            this.tableSprite.scale3d.z = tableScale;

            this.tableSprite.position3d.y = isMobile ? 150 : 300; 
            this.tableSprite.position3d.z = 800; 
        }

        // Cards settings
        const gap = isMobile ? 150 : 200; 
        const cardsY = isMobile ? 60 : 100; 

        this.cards.forEach((card, i) => {
            card.position3d.x = (i - 1) * gap;
            card.position3d.y = cardsY;
            card.position3d.z = 0; 
            card.euler.x = -0.20;

            const s = isMobile ? 0.14 : 0.17;
            card.scale3d.x = s;
            card.scale3d.y = s;
            card.scale3d.z = s;
        });

        const bottomY = height - (isMobile ? 60 : 80);
        const btnScaleMobile = 0.30; 
        const btnScaleDesktop = 0.50; 
        const currentBtnScale = isMobile ? btnScaleMobile : btnScaleDesktop;
        const spacing = isMobile ? (width * 0.22) : 240; 

        if (this.playButton) { 
            this.playButton.position.set(centerX, bottomY); 
            this.playButton.scale.set(currentBtnScale + 0.1); 
        }
        
        if (this.autoButton) { 
            this.autoButton.position.set(centerX + spacing, bottomY); 
            this.autoButton.scale.set(currentBtnScale); 
        }
        
        if (this.betButton) { 
            this.betButton.position.set(centerX - spacing, bottomY); 
            this.betButton.scale.set(currentBtnScale); 
        }
        
        if (this.speedButton) { 
            this.speedButton.position.set(centerX - (spacing * 2), bottomY); 
            this.speedButton.scale.set(currentBtnScale); 
        }
        
        if (this.payTableButton) {
            const payTableX = isMobile ? 60 : 120;
            const payTableY = isMobile ? 50 : 80;
            this.payTableButton.position.set(payTableX, payTableY);
            this.payTableButton.scale.set(isMobile ? 0.25 : 0.35);
        }

        if (this.resultText) {
            this.resultText.position.set(centerX, centerY - 250); 
            this.resultText.style.fontSize = isMobile ? 40 : 60;
        }

        if (this.currentBetText) {
            const betBtnX = centerX - spacing;
            this.currentBetText.position.set(betBtnX, bottomY - (isMobile ? 50 : 70));
            this.currentBetText.style.fontSize = isMobile ? 18 : 24;
        }
        if (this.payTablePopup) {
            this.payTablePopup.position.set(centerX, centerY);
            const popupScale = Math.min(1, (width * 0.9) / 400);
            this.payTablePopup.scale.set(popupScale);
        }
    }
    
    private initCards() {
        for (let i = 0; i < 3; i++) {
            const card = new Card(`back${i+1}`, `front${i+1}`);
            card.position3d.x = (i - 1) * 200;
            this.cards.push(card);
            this.world.addChild(card);
        }
    }
    
    private initUI() {
        this.playButton = this.createButton('btn_play'); 
        this.playButton.on('pointerdown', () => { if (this.isAutoPlaying) this.toggleAuto(); else this.startRound(); });
        this.uiContainer.addChild(this.playButton);

        this.betButton = this.createButton('btn_bet'); 
        this.betButton.on('pointerdown', () => this.cycleBet());
        this.uiContainer.addChild(this.betButton);

        const initialBet = BET_OPTIONS[this.currentBetIndex];
        this.currentBetText = new PIXI.Text(`BET: $${initialBet}`, { fontFamily: 'Arial', fontSize: 24, fontWeight: 'bold', fill: 0xFFD700, stroke: '#000000', strokeThickness: 4, align: 'center' });
        this.currentBetText.anchor.set(0.5);
        this.uiContainer.addChild(this.currentBetText);

        this.autoButton = this.createButton('btn_auto'); 
        this.autoButton.on('pointerdown', () => this.toggleAuto());
        this.uiContainer.addChild(this.autoButton);

        this.speedButton = this.createButton('btn_speed'); 
        this.speedButton.on('pointerdown', () => this.cycleSpeed());
        this.uiContainer.addChild(this.speedButton);

        this.payTableButton = this.createButton('btn_paytable'); 
        this.payTableButton.on('pointerdown', () => this.togglePayTable());
        this.uiContainer.addChild(this.payTableButton);

        this.resultText = new PIXI.Text("", { fontSize: 60, fill: 0xFFFFFF, stroke: '#000000', strokeThickness: 4, dropShadow: true, dropShadowBlur: 2, dropShadowColor: 0x000000, dropShadowAlpha: 0.3, dropShadowDistance: 3, align: 'center' });
        this.resultText.anchor.set(0.5);
        this.uiContainer.addChild(this.resultText);
    }
    
    private createButton(alias: string): PIXI.Container {
        const btn = new PIXI.Container();
        const s = PIXI.Sprite.from(alias);
        s.anchor.set(0.5);
        btn.addChild(s);
        btn.eventMode = 'static';
        btn.cursor = 'pointer';
        btn.on('pointerdown', () => { s.scale.set(0.90); });
        btn.on('pointerup', () => { s.scale.set(1.0); });
        btn.on('pointerupoutside', () => { s.scale.set(1.0); });
        return btn;
    }

    private updateButtonTexture(btn: PIXI.Container, alias: string) { (btn.getChildAt(0) as PIXI.Sprite).texture = PIXI.Assets.get(alias); }
    private cycleBet() { if(this.state !== GameState.IDLE && this.state !== GameState.RESULT) return; if(this.isAutoPlaying) this.toggleAuto(); this.currentBetIndex = (this.currentBetIndex + 1) % BET_OPTIONS.length; this.currentBetText.text = `BET: $${BET_OPTIONS[this.currentBetIndex]}`; }
    private cycleSpeed() { if(this.state !== GameState.IDLE && this.state !== GameState.RESULT) return; this.currentSpeed = this.currentSpeed === GameSpeed.NORMAL ? GameSpeed.FAST : (this.currentSpeed === GameSpeed.FAST ? GameSpeed.INSTANT : GameSpeed.NORMAL); (this.speedButton.getChildAt(0) as PIXI.Sprite).tint = this.currentSpeed === GameSpeed.NORMAL ? 0xFFFFFF : (this.currentSpeed === GameSpeed.FAST ? 0xAAAAFF : 0xFFAAAA); }
    private toggleAuto() { this.isAutoPlaying = !this.isAutoPlaying; (this.autoButton.getChildAt(0) as PIXI.Sprite).tint = this.isAutoPlaying ? 0x77FF77 : 0xFFFFFF; this.updateButtonTexture(this.playButton, this.isAutoPlaying ? "btn_stop" : "btn_play"); if (this.isAutoPlaying && this.state === GameState.IDLE) this.startRound(); }
    private initPayTablePopup() { this.payTablePopup = new PIXI.Container(); this.payTablePopup.visible = false; const bg = new PIXI.Graphics(); bg.beginFill(0x000000, 0.95); bg.lineStyle(2, 0xFFD700); bg.drawRect(0, 0, 400, 500); bg.endFill(); this.payTablePopup.addChild(bg); const t = new PIXI.Text('MULTIPLIERS', {fill:0xFFFFFF, fontSize:24, fontWeight:'bold'}); t.position.set(20,20); this.payTablePopup.addChild(t); let y = 70; PAY_TABLE.forEach(i => { const r = new PIXI.Text(`${i.value}x - ${i.chance}%`, {fill:0xFFD700, fontSize:18}); r.position.set(20, y); this.payTablePopup.addChild(r); y+=30; }); const c = new PIXI.Text('X', {fill:0xFF0000, fontSize:30, fontWeight:'bold'}); c.position.set(360,10); c.eventMode='static'; c.cursor='pointer'; c.on('pointerdown', ()=>this.payTablePopup.visible=false); this.payTablePopup.addChild(c); this.payTablePopup.pivot.set(200,250); this.uiContainer.addChild(this.payTablePopup); }
    private togglePayTable() { this.payTablePopup.visible = !this.payTablePopup.visible; }
    private getRandomMultiplier(): MultiplierData { const total = PAY_TABLE.reduce((s, i) => s + i.chance, 0); let r = Math.random() * total; for (const i of PAY_TABLE) { if (r < i.chance) return i; r -= i.chance; } return PAY_TABLE[0]; }
    
    private async startRound() {
        if (this.state !== GameState.IDLE) return;
        this.state = GameState.ROUND_START;
        this.uiContainer.children.forEach(c => { if (c!==this.resultText && c!==this.payTablePopup) { c.visible = (this.isAutoPlaying && (c===this.playButton || c===this.autoButton)); } });
        this.payTablePopup.visible = false;
        this.resultText.text = "";
        this.cards.forEach(c => c.reset());
        
        const results = [this.getRandomMultiplier(), this.getRandomMultiplier(), this.getRandomMultiplier()];
        this.cards.forEach((c, i) => c.setOutcome(results[i]));
        
        this.state = GameState.REVEAL;
        let dur = this.currentSpeed === GameSpeed.INSTANT ? 0 : (this.currentSpeed === GameSpeed.FAST ? 0.3 : 0.8);
        let stag = this.currentSpeed === GameSpeed.INSTANT ? 0 : (this.currentSpeed === GameSpeed.FAST ? 150 : 300);
        
        for (let i=0; i<3; i++) {
            if(stag > 0) await new Promise(r => setTimeout(r, stag));
            await this.cards[i].flip(dur);
        }
        this.showResult(results);
    }

    private showResult(results: MultiplierData[]) {
        this.state = GameState.RESULT;
        const total = results.reduce((acc, c) => acc * c.value, 1);
        const payout = BET_OPTIONS[this.currentBetIndex] * total;
        this.resultText.text = `Payout: $${payout.toFixed(2)}\n(${total.toFixed(1)}x)`;
        this.resultText.scale.set(0);
        const animDur = this.currentSpeed === GameSpeed.INSTANT ? 0.2 : 0.5;
        gsap.to(this.resultText.scale, {x:1, y:1, duration:animDur, ease:"back.out(1.7)"});
        
        let wait = this.currentSpeed === GameSpeed.INSTANT ? 500 : (this.currentSpeed === GameSpeed.FAST ? 1000 : 1500);
        setTimeout(() => {
            this.state = GameState.IDLE;
            this.uiContainer.children.forEach(c => { if(c!==this.payTablePopup) c.visible=true; });
            if (this.isAutoPlaying) this.startRound();
            else { this.playButton.visible=true; this.updateButtonTexture(this.playButton, "btn_play"); }
        }, wait);
    }
}