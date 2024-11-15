import * as Globals from './globals.js';
import { Room } from './graphics.js';

(async () =>
    {

        // Create a new application
        const app = new PIXI.Application();
        await app.init({ background: 0xf0fbfc, resizeTo: window, antialias: true });
        document.body.appendChild(app.canvas);

        app.stage.addChild(Globals.backGroundContainer);
        app.stage.addChild(Globals.graphContainer);
        

        // Function to draw the gridlines
        function drawGrid() {
            const grid = new PIXI.Graphics();
            const gridSize = 50; // Size of each grid cell


            // Draw vertical lines
            for (let x = 0; x <= app.screen.width; x += gridSize) {
                grid.moveTo(x, 0);
                grid.lineTo(x, app.screen.height)
                grid.stroke({texture: PIXI.Texture.WHITE,  width: 1, color: 0xe8e8e8});
                ;
            }

            // Draw horizontal lines
            for (let y = 0; y <= app.screen.height; y += gridSize) {
                grid.moveTo(0, y);
                grid.lineTo(app.screen.width, y)
                grid.stroke({texture: PIXI.Texture.WHITE,  width: 1, color: 0xe8e8e8});
                ;
            }

            Globals.backGroundContainer.addChild(grid);
        }


        // Function to draw the spatial graph
        function drawSpatialGraph() {
            // Globals.spatialGraph.edges.forEach(edge => {
            //     const wall = new Wall(Globals.graphContainer, edge.v1.x, edge.v1.y, edge.v2.x, edge.v2.y);
            // });
            Globals.spatialGraph.spaces.forEach(space => {
                const room = new Room(Globals.graphContainer, space);
            });
        }

        // Initial draw
        drawGrid();

        drawSpatialGraph();
       

        // Move the container to the center
        Globals.graphContainer.x = app.screen.width / 2;
        Globals.graphContainer.y = app.screen.height / 2;
    

        Globals.graphContainer.pivot.x = Globals.graphContainer.width / 2;
        Globals.graphContainer.pivot.y = Globals.graphContainer.height / 2;

        // Listen for animate update
        app.ticker.add((time) =>
        {
            // Continuously rotate the container!
            // * use delta to create frame-independent transform *
            // container.rotation -= 0.01 * time.deltaTime;
        });
    })();