class Vertex {
    constructor(id, x, y) {
        this.id = id;
        this.x = x; 
        this.y = y;
        this.dragging = false;
    }

    draw() {
        strokeWeight(1)
        circle(this.x, this.y, 10) 
    }

    checkDragging() {
        // Check if the mouse is over the vertex
        let d1 = dist(mouseX, mouseY, this.x, this.y);
        if (d1 < 10) {
          this.dragging = true;

        } else  {
          this.dragging = false;
        }
      }

    updateCoordinates() {
    // Update the coordinates of the vertex when dragging
        if (this.dragging) {
            this.x = mouseX;
            this.y = mouseY;
        } 
    }
}


class Edge {
    constructor(id, v1, v2) {
        this.id = id;
        this.v1 = v1;
        this.v2 = v2;
        this.data = {source: v1, target: v2, relation: "LBOR"}
        this.dragging = false;
        this.orientation = function() {
            // Calculate the orientation of the edge
            let x1 = this.v1.x;
            let y1 = this.v1.y;
            let x2 = this.v2.x;
            let y2 = this.v2.y;

            if ((y2 - y1) == 0 || (y2 - y1) == -0) {
                return "horizontal"
            } else if ((x2 - x1) == 0 || (x2 - x1) == -0){
                return "vertical"
            }
        }
    }

    draw() {
        strokeWeight(2)
        line(this.v1.x, this.v1.y, this.v2.x, this.v2.y)
    }

    checkDragging() {
        if (isPointOnLine(this.v1.x, this.v1.y, this.v2.x, this.v2.y, mouseX, mouseY)) {
           this.dragging = true;
        } else {
           this.dragging = false;
        }
    }

    updateCoordinates() {
        // Update the coordinates of the attached vertices when dragging
        if (this.dragging) {
            if (this.orientation() == "vertical") {
                this.v1.x = mouseX;
                this.v2.x = mouseX;
            } else if (this.orientation() == "horizontal") {
                this.v1.y = mouseY;
                this.v2.y = mouseY;
            }
        } 
    }
}

class Space {
    constructor(id, vertices, edges) {
        this.id = id;
        this.vertices = vertices;
        this.edges = edges;
    }

    // // Attributes
    getArea(vertArray) {
        // Calculate the area of the space
        let area = 0;
        let j = this.vertices.length - 1;
        for (let i = 0; i < this.vertices.length; i++) {
            area += (vertArray[this.vertices[j]].x + vertArray[this.vertices[i]].x) * (vertArray[this.vertices[j]].y - vertArray[this.vertices[i]].y);
            j = i;
        }
        return Math.round(Math.abs(area / 2));
    }

    // Visualisation
    getCenterPoint(vertArray) {
        // Calculate the center point of the space
        let x = 0;
        let y = 0;
        for (let i = 0; i < this.vertices.length; i++) {
            x += vertArray[this.vertices[i]].x;
            y += vertArray[this.vertices[i]].y;
        }
        return {x: x / this.vertices.length, y: y / this.vertices.length};
    }

    draw(vertArray) {

        let area = this.getArea(vertArray)
        if (area <= 20000) {
            fill(255, 0, 0, 75)
        } else {
            fill(0, 255, 0, 75)
        }
        let areatext = Math.round(area / 1000) + "m2"


        beginShape();
        for (let i = 0; i < this.vertices.length; i++) {
            vertex(vertArray[this.vertices[i]].x, vertArray[this.vertices[i]].y);
        }
        endShape(CLOSE);


        // Draw area size 
        fill(0,0,0,100)
        textSize(20)
        textAlign(CENTER, CENTER)

        let coords = this.getCenterPoint(vertArray)
        text(areatext, coords.x, coords.y)
    }

}

class SpatialGraph { 
    constructor(){ 
        this.vertices = [];
        this.edges = [];
        this.spaces = [];
    }
    
    findVertexByCoords(x, y) {
        // Find first occurence of a vertex with given coordinates and return its id
        for (let vert in this.vertices) {
            if (this.vertices[vert].x == x && this.vertices[vert].y == y) {
                return vert;
            }
        }
        return undefined
    }

    addVertex(x, y) {
        let vfound = this.findVertexByCoords(x, y);
        if (vfound) {
            return parseInt(vfound);
        } else {
            let id = this.vertices.length;
            let vertex = new Vertex(id, x, y);
            this.vertices.push(vertex);
            return id;
        }
    }

    findEdgeByVertexIds(id1, id2) {
        // Find first occurence of an edge with given vertex ids
        for (let edge in this.edges) {
            if ((this.edges[edge].v1.id == id1 && this.edges[edge].v2.id == id2) || (this.edges[edge].v1.id == id2 && this.edges[edge].v2.id == id1)) {
                return edge;
            }
        }
    }

    addEdge(vId1, vId2) {
        let efound = this.findEdgeByVertexIds(vId1, vId2);
        if (efound) {
            return parseInt(efound);
        } else {
            let id = this.edges.length;
            let edge = new Edge(id, this.vertices[vId1], this.vertices[vId2]);
            this.edges.push(edge);
            return id;
        }

    }

    addSpace(coordArray) {
        let spaceVerts = [];
        let spaceEdges = [];

        for (let coord in coordArray) {
            let vfound = this.findVertexByCoords(coordArray[coord].x/200, coordArray[coord].y/200); // Scaling factor applied for POC.
            
            if (vfound) {
                spaceVerts.push(parseInt(vfound));
            } else {
                let vId = this.addVertex(coordArray[coord].x/200, coordArray[coord].y/200); // Scaling factor applied for POC.
                spaceVerts.push(vId);
            }
        }

        for (let i = 0; i < spaceVerts.length; i++)  {
            if (i == spaceVerts.length - 1) {
                let efound = this.findEdgeByVertexIds(spaceVerts[i], spaceVerts[0]);

                if (efound) {
                    spaceEdges.push(parseInt(efound));
                } else {
                    let eId = this.addEdge(spaceVerts[i], spaceVerts[0]);
                    spaceEdges.push(eId);
                }
            } else {
                let efound = this.findEdgeByVertexIds(spaceVerts[i], spaceVerts[i+1]);

                if (efound) {
                    spaceEdges.push(parseInt(efound));
                } else {
                    let eId = this.addEdge(spaceVerts[i], spaceVerts[i+1]);
                    spaceEdges.push(eId);
                }
            }
        }

        let sId = this.spaces.length;
        let space = new Space(sId, spaceVerts, spaceEdges);
        this.spaces.push(space);
    }

    toJson() {
        let json = {"spatialGraph": {
            "vertices": this.vertices.map(vertex => {
                const { dragging, ...vertexObj } = vertex;
                return vertexObj;
            }),
            "edges": this.edges.map(edge => {
                return {"id": edge.id, "vertices": [edge.v1.id, edge.v2.id]};
            }),
            "spaces": this.spaces
            }
        }
        return JSON.stringify(json);
    }
}


