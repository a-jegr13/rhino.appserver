import { Vertex, Edge, SpatialGraph } from './spatialGraph.js';


// SpatialGraph
export const spatialGraph = new SpatialGraph();
// Dummy data for the spatial graph
spatialGraph.addSpace([{x: 0, y: 0}, {x: 800, y: 0}, {x: 800, y: 400}, {x: 0, y: 400}], "Woonkamer");
spatialGraph.addSpace([{ x: 800, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 400 }, { x: 800, y: 400 }], "Keuken");

spatialGraph.addSpace([{x: 0, y: 0}, {x: 400, y: 0}, {x: 400, y: 100}, {x: 0, y: 100}], "Badkamer");
spatialGraph.addSpace([{x: 600, y: 300}, {x: 800, y: 300}, {x: 800, y: 400}, {x: 600, y: 400}], "Toilet");

spatialGraph.addSpace([{x: 600, y: 0}, {x: 800, y: 0}, {x: 800, y: 200}, {x: 600, y: 200}], "Toilet");
spatialGraph.addSpace([{x: 0, y: 300}, {x: 200, y: 300}, {x: 200, y: 400}, {x: 0, y: 400}], "Badkamer");


console.log(spatialGraph);


// console.log(spatialGraph.edges);
// console.log(spatialGraph.vertices);
// console.log(spatialGraph.spaces);
// console.log(spatialGraph.findSpacesWithEdge(3));


// Graphics globals
export const backGroundContainer = new PIXI.Container();
export const graphContainer = new PIXI.Container();


// Interactivity globals
export let graphInfoMode = true;
// Add event listener for the toggle graph info button
document.getElementById('toggleGraphInfoButton').addEventListener('click', function () {
    graphInfoMode = !graphInfoMode;
    console.log(graphInfoMode)
});



export let mode = 'draw';
export let drawing = false;
