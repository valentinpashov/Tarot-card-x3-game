import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { MultiplierData } from './types';

export class Card extends PIXI.Container {
    private backMesh: PIXI.MeshPlane;
    private frontMesh: PIXI.MeshPlane;
    
    private frontText: PIXI.Text;
    private contentContainer: PIXI.Container; 

    constructor(backTexAlias: string, frontTexAlias: string) {
        super();

        this.contentContainer = new PIXI.Container();
        this.addChild(this.contentContainer);

        // Back of the card 
        const tex1 = PIXI.Assets.get(backTexAlias);
        this.backMesh = new PIXI.MeshPlane({ texture: tex1, verticesX: 2, verticesY: 2 });
        this.backMesh.pivot.set(tex1.width / 2, tex1.height / 2); 
        
        // Font of the card
        const tex2 = PIXI.Assets.get(frontTexAlias);
        this.frontMesh = new PIXI.MeshPlane({ texture: tex2, verticesX: 2, verticesY: 2 });
        this.frontMesh.pivot.set(tex2.width / 2, tex2.height / 2);
        this.frontMesh.visible = false;
        this.frontMesh.scale.x = 0; 

        this.frontText = new PIXI.Text({ 
            text: '', 
            style: {
                fontSize: 130, 
                fontWeight: 'bold', 
                fill: 0xFFFFFF, 
                stroke: { color: 0x000000, width: 8 },
                dropShadow: { blur: 4, color: 0x000000, alpha: 0.5, distance: 4 }
            }
        });

        this.frontText.anchor.set(0.5);
        this.frontText.position.set(tex2.width / 2, tex2.height / 2);
        
        this.contentContainer.addChild(this.backMesh);
        this.contentContainer.addChild(this.frontMesh);
        
        this.frontMesh.addChild(this.frontText); 
    }

    public setPerspective(intensity: number) {
        this.applyMeshPerspective(this.backMesh, intensity);
        this.applyMeshPerspective(this.frontMesh, intensity);
    }

    private applyMeshPerspective(mesh: PIXI.MeshPlane, intensity: number) {
        const buffer = mesh.geometry.getAttribute('aPosition').buffer;
        const w = mesh.texture.width;
        
        buffer.data[0] = 0; buffer.data[2] = w;
            
        const offset = w * intensity;   // Perspective effect 
        buffer.data[0] += offset;       // Perspective effect
        buffer.data[2] -= offset;       // Perspective effect
        
        buffer.update();
    }

    public setOutcome(data: MultiplierData) {
        this.frontText.text = `${data.value}x`;
    }

    public async flip(duration: number = 0.5): Promise<void> {
        if (duration <= 0) {
            this.backMesh.scale.x = 0;
            this.backMesh.visible = false;
            this.frontMesh.visible = true;
            this.frontMesh.scale.x = 1;
            return Promise.resolve();
        }

        return new Promise((resolve) => {
            const tl = gsap.timeline({ onComplete: resolve });
            tl.to(this.backMesh.scale, { x: 0, duration: duration / 2, ease: "power1.in" });
            tl.call(() => {
                this.backMesh.visible = false;
                this.frontMesh.visible = true;
            });
            tl.to(this.frontMesh.scale, { x: 1, duration: duration / 2, ease: "power1.out" });
        });
    }

    public reset() {
        this.backMesh.visible = true;
        this.backMesh.scale.set(1); 
        this.frontMesh.visible = false;
        this.frontMesh.scale.x = 0;
        this.rotation = 0;
        this.y = 0; 
    }
}