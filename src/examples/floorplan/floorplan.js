import { Application } from "pixi.js";

(async () => {
    const app = new Application();

    await app.init({
        backgroundcolor: 0xFFFFFF,
    })

    document.body.appendChild(app.canvas);
    
})();