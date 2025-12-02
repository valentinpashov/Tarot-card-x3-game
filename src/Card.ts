import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { MultiplierData } from './types';
import { Container3d, Sprite3d, Text3d, Camera3d } from 'pixi-projection';

export class Card extends Container3d {
    private backSprite: Sprite3d;
    private frontSprite: Sprite3d;
    private frontText: PIXI.Text; 
    private innerFace: Container3d;
    public currentAngle: number = 0;

    constructor(backTexAlias: string, frontTexAlias: string) {
        super();

        // Back 
        const texBack = PIXI.Assets.get(backTexAlias);
        this.backSprite = new Sprite3d(texBack);
        this.backSprite.anchor.set(0.5);
        this.backSprite.visible = true;

        // Front
        this.innerFace = new Container3d();
        this.innerFace.visible = false;
        const texFront = PIXI.Assets.get(frontTexAlias);
        this.frontSprite = new Sprite3d(texFront);
        this.frontSprite.anchor.set(0.5);
        this.innerFace.addChild(this.frontSprite);

        this.frontText = new PIXI.Text('', {
            fontSize: 130, 
            fontWeight: 'bold', 
            fill: 0xFFFFFF, 
            stroke: '#000000',
            strokeThickness: 8,
            dropShadow: true,
            dropShadowBlur: 4,
            dropShadowDistance: 4
        });
        this.frontText.anchor.set(0.5);
        
        const textWrapper = new Sprite3d(PIXI.Texture.EMPTY);
        textWrapper.addChild(this.frontText);
        this.innerFace.addChild(textWrapper);

        this.addChild(this.backSprite);
        this.addChild(this.innerFace);
        this.euler.y = 0;
    }

    public setOutcome(data: MultiplierData) {
        this.frontText.text = `${data.value}x`;
    }

    public update(dt: number) {
        let angle = this.euler.y % (Math.PI * 2);
        if (angle < 0) angle += Math.PI * 2;

        const isBackFacing = (angle < Math.PI / 2 || angle > 3 * Math.PI / 2);

        if (isBackFacing) {
            this.backSprite.visible = true;
            this.innerFace.visible = false;
            this.backSprite.scale.x = 1; 
        } else {
            this.backSprite.visible = false;
            this.innerFace.visible = true;
            this.innerFace.scale.x = -1; 
        }
    }

    public async flip(duration: number = 1.0): Promise<void> {
        return new Promise((resolve) => {
            const targetY = Math.PI;
            const tl = gsap.timeline({ onComplete: resolve });
            
            tl.to(this.position3d, { z: -100, duration: duration * 0.5, ease: "sine.out" }, 0);
            tl.to(this.euler, { y: targetY, duration: duration, ease: "power1.inOut" }, 0);
            tl.to(this.position3d, { z: 0, duration: duration * 0.5, ease: "sine.in" }, duration * 0.5);
        });
    }

    public reset() {
        this.euler.y = 0;
        this.position3d.z = 0;
        this.backSprite.visible = true;
        this.innerFace.visible = false;
    }
}