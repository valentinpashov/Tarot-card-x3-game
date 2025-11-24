import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { MultiplierData } from './types';

export class Card extends PIXI.Container {
    private backSprite: PIXI.Sprite;
    private frontSprite: PIXI.Sprite;
    private frontText: PIXI.Text;

    constructor(backTex: string, frontTex: string) {
        super();

        // back
        this.backSprite = PIXI.Sprite.from(backTex);
        this.backSprite.anchor.set(0.5);
        this.backSprite.scale.set(1);

        // font
        this.frontSprite = PIXI.Sprite.from(frontTex);
        this.frontSprite.anchor.set(0.5);
        this.frontSprite.scale.set(1);
        this.frontSprite.visible = false;
        this.frontSprite.scale.x = 0;

        this.frontText = new PIXI.Text({ 
            text: '', 
            style: {
                fontSize: 140, 
                fontWeight: 'bold', 
                fill: 0xFFFFFF, 
                stroke: { color: 0x000000, width: 8 }
            }
        });
        this.frontText.anchor.set(0.5);
        this.frontSprite.addChild(this.frontText);

        this.addChild(this.backSprite);
        this.addChild(this.frontSprite);
    }

    public setOutcome(data: MultiplierData) {
        this.frontText.text = `${data.value}x`;
    }

    public async flip(duration: number = 0.5): Promise<void> {
        if (duration <= 0) {
            this.backSprite.scale.x = 0;
            this.backSprite.visible = false;
            this.frontSprite.visible = true;
            this.frontSprite.scale.x = 1;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve });

            tl.to(this.backSprite.scale, { x: 0, duration: duration / 2, ease: "power1.in" });
            tl.call(() => {
                this.backSprite.visible = false;
                this.frontSprite.visible = true;
            });
            tl.to(this.frontSprite.scale, { x: 1, duration: duration / 2, ease: "power1.out" });
        });
    }

    public reset() {
        this.backSprite.visible = true;
        this.backSprite.scale.set(1);
        this.frontSprite.visible = false;
        this.frontSprite.scale.x = 0;
        this.rotation = 0;
    }
}