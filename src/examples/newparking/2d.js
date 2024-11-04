// Globals
var coordDict = {};


function calcVertexDistance(v1, v2) {
    // Calculate the distance between two vertices
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) + Math.pow(v1.y - v2.y, 2))
}

var spatialGraph = new SpatialGraph();

// Main
function setup() {
    let p5canvas = document.getElementById("p5-canvas")

    createCanvas(window.innerWidth / 2, window.innerHeight, p5canvas);

    // Create list with points to create the graph
    polygons = getPolygons(dc)
    for (let i = 0; i < polygons.length; i++) {
        let coords = parseWKTPolygon(polygons[i]);
        coordDict[i] = coords.slice(0, 4);
    }

    // Create the graph
    for (let key in coordDict) {
        spatialGraph.addSpace(coordDict[key]);
    }    

    // console.log(spatialGraph.toJson())
}


function draw() {
    background(220);

    // Draw space information
    for (space in spatialGraph.spaces) {
        spatialGraph.spaces[space].draw(spatialGraph.vertices);
    }

    // Draw the edges
    for (edge in spatialGraph.edges) {
        spatialGraph.edges[edge].draw();
    }
    
    // Draw the vertices
    for (vert in spatialGraph.vertices) {
        spatialGraph.vertices[vert].draw();
    }
} 

function mousePressed() {
    // Check if an edge can be dragged
    for (edge in spatialGraph.edges) {
        spatialGraph.edges[edge].checkDragging();
    }

    // Check if a vertex can be dragged
    for (vert in spatialGraph.vertices) {
            spatialGraph.vertices[vert].checkDragging();
    }
}

function mouseDragged() {
    // Update coordinates of an edge where applicable
    for (edge in spatialGraph.edges) {
        spatialGraph.edges[edge].updateCoordinates();
    }

    // Update coordinates of a vertex where applicable
    for (vert in spatialGraph.vertices) {
            spatialGraph.vertices[vert].updateCoordinates();
    }
}
