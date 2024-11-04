import { SpatialGraph } from './spatialGraph.js';
import * as Utils from './utils.js';



// Create the application helper and add its render target to the page
const app = new PIXI.Application();
await app.init({
    antialias: true,
    transparent: false,
    resolution: window.devicePixelRatio || 1,
    backgroundColor: 0x00FF00
})
document.body.appendChild(app.canvas);

const coordDict = {};
// Create list with points to create the graph
const polygons = Utils.getPolygons(dc)
for (let i = 0; i < polygons.length; i++) {
    let coords = Utils.parseWKTPolygon(polygons[i]);
    coordDict[i] = coords.slice(0, 4);
}

// Create the graph
let spatialGraph = new SpatialGraph();
for (let key in coordDict) {
    spatialGraph.addSpace(coordDict[key]);
}



// Draw vertices and edges using PixiJS
function drawGraph() {
    spatialGraph.vertices.forEach(vertex => {
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0x003865);
        graphics.drawCircle(vertex.x, vertex.y, 5);
        graphics.endFill();
        app.stage.addChild(graphics);
    });

    spatialGraph.edges.forEach(edge => {
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(4, 0xFFFFFF); // White color for edges and thicker lines
        graphics.moveTo(edge.v1.x, edge.v1.y);
        graphics.lineTo(edge.v2.x, edge.v2.y);
        graphics.endFill();
        app.stage.addChild(graphics);
    });
}

// Draw the graph
drawGraph();

// Function to zoom out and fit the contents
function fitToScreen() {
    const bounds = app.stage.getBounds();
    const scaleX = app.screen.width / bounds.width;
    const scaleY = app.screen.height / bounds.height;
    const scale = Math.min(scaleX, scaleY);

    app.stage.scale.set(scale);
    app.stage.position.set(
        (app.screen.width - bounds.width * scale) / 2 - bounds.x * scale,
        (app.screen.height - bounds.height * scale) / 2 - bounds.y * scale
    );
}

// Fit the contents to the screen
fitToScreen();