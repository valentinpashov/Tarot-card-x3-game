import './style.css'
import * as PIXI from 'pixi.js';
import { Game } from './Game';

(async () => {
    const app = new PIXI.Application();
    await app.init({ 
        width: window.innerWidth, 
        height: window.innerHeight,
        backgroundColor: 0x000000,
        resizeTo: window, 
        resolution: window.devicePixelRatio || 1,
        autoDensity: true
    });

    document.body.appendChild(app.canvas);

    const game = new Game(app);

    //Responsive 
    app.renderer.on('resize', () => {
        game.resize(app.screen.width, app.screen.height);
    });
})();