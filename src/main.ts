import './style.css'
import * as PIXI from 'pixi.js';
import { Game } from './Game';

const app = new PIXI.Application({ 
    width: window.innerWidth, 
    height: window.innerHeight,
    backgroundColor: 0x000000,
    resizeTo: window, 
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
});

document.body.appendChild(app.view as HTMLCanvasElement);

const game = new Game(app);

app.renderer.on('resize', () => {
    game.resize(app.screen.width, app.screen.height);
});