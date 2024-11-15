class Vertex {
    constructor(id, x, y) {
        this.id = id;
        this.x = x; 
        this.y = y;
    }

    updateCoordinates() {
        return undefined
    }
}


class Edge {
    constructor(id, v1, v2) {
        this.id = id;
        this.v1 = v1;
        this.v2 = v2;
        this.orientation = function() {
            // Calculate the orientation of the edge
            let x1 = this.edge.v1.x;
            let y1 = this.edge.v1.y;
            let x2 = this.edge.v2.x;
            let y2 = this.edge.v2.y;

            if ((y2 - y1) == 0 || (y2 - y1) == -0) {
                return "horizontal"
            } else if ((x2 - x1) == 0 || (x2 - x1) == -0){
                return "vertical"
            }
        }
    }

    updateCoordinates() {
        return undefined
    }
}

class Space {
    constructor(id, name, vertices, edges) {
        this.id = id;
        this.name = name;
        this.vertices = vertices;
        this.edges = edges;
    }

    getArea(vertArray) {
        let area = 0;
        let j = this.vertices.length - 1;

        for (let i = 0; i < this.vertices.length; i++) {
            let x0 = vertArray[this.vertices[j]].x;
            let y0 = vertArray[this.vertices[j]].y;
            let x1 = vertArray[this.vertices[i]].x;
            let y1 = vertArray[this.vertices[i]].y;

            area += (x0 + x1) * (y0 - y1);
            j = i;
        }

        return Math.abs(area / 2);
    }

    getCentroid(vertArray) {
        let xSum = 0;
        let ySum = 0;
        let area = this.getArea(vertArray);
        let j = this.vertices.length - 1;

        for (let i = 0; i < this.vertices.length; i++) {
            let x0 = vertArray[this.vertices[j]].x;
            let y0 = vertArray[this.vertices[j]].y;
            let x1 = vertArray[this.vertices[i]].x;
            let y1 = vertArray[this.vertices[i]].y;

            let crossProduct = (x0 * y1 - x1 * y0);
            xSum += (x0 + x1) * crossProduct;
            ySum += (y0 + y1) * crossProduct;
            j = i;
        }

        let factor = 1 / (6 * area);
        let centroidX = xSum * factor;
        let centroidY = ySum * factor;

        return { x: centroidX, y: centroidY };
    }

    toPolygon(vertArray) {
        return this.vertices.map(vId => [vertArray[vId].x, vertArray[vId].y]);
    }
}

class SpatialGraph { 
    constructor(){ 
        this.vertices = [];
        this.edges = [];
        this.spaces = [];

        this.edgesToAdjust = [];
        this.spacesToUpdate = [];

        // this.cy = cytoscape();
    }
    
    isVertexOnEdge(vertex, edge) {
        const crossProduct = (vertex.y - edge.v1.y) * (edge.v2.x - edge.v1.x) - (vertex.x - edge.v1.x) * (edge.v2.y - edge.v1.y);
        if (Math.abs(crossProduct) > Number.EPSILON) return false;

        const dotProduct = (vertex.x - edge.v1.x) * (edge.v2.x - edge.v1.x) + (vertex.y - edge.v1.y) * (edge.v2.y - edge.v1.y);
        if (dotProduct < 0) return false;

        const squaredLengthBA = (edge.v2.x - edge.v1.x) * (edge.v2.x - edge.v1.x) + (edge.v2.y - edge.v1.y) * (edge.v2.y - edge.v1.y);
        if (dotProduct > squaredLengthBA) return false;

        return true;
    }

    findVertexIdByCoords(x, y) {
        // Find first occurence of a vertex with given coordinates and return its id
        for (let vert in this.vertices) {
            if (this.vertices[vert].x == x && this.vertices[vert].y == y) {
                return vert;
            }
        }
        return undefined
    }
    
    getVertexNeighbors(vertexId, edgeIds) {
        // Checks for neighboring vertices given a set of edges. 
        // Makes it possible to search the whole graph or a subset.
        const neighbors = [];
        edgeIds.forEach(edgeId => {
            const edge = this.edges[edgeId];
            if (edge.v1.id === vertexId) {
                neighbors.push(edge.v2.id);
            } else if (edge.v2.id === vertexId) {
                neighbors.push(edge.v1.id);
            }
        });
        return neighbors;
    }

    getDistanceBetweenVertices(v1, v2) {
        const vertex1 = this.vertices[v1];
        const vertex2 = this.vertices[v2];
        return Math.sqrt(Math.pow(vertex1.x - vertex2.x, 2) + Math.pow(vertex1.y - vertex2.y, 2));
    }


    getDistanceToCentroid(vertexId, centroid) {
        const vertex = this.vertices[vertexId];
        const dx = vertex.x - centroid.x;
        const dy = vertex.y - centroid.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    findSpaceClosingPath(startVertex, endVertex, space) {
        // Dijkstra's algorithm
        const distances = {};
        const previous = {};
        const pq = new PriorityQueue((a, b) => distances[a] < distances[b]);
    
        this.vertices.forEach(vertex => {
            distances[vertex.id] = Infinity;
            previous[vertex.id] = null;
        });
        distances[startVertex] = 0;
        pq.enqueue(startVertex);
    
        while (!pq.isEmpty()) {
            const currentVertex = pq.dequeue();
    
            if (currentVertex === endVertex) {
                const path = [];
                let vertex = endVertex;
                while (vertex !== null) {
                    path.unshift(vertex);
                    vertex = previous[vertex];
                }
                return path;
            }
    
            const validNeighbors = this.getVertexNeighbors(currentVertex, this.edges.map(edge => edge.id))
                .filter(neighbor => neighbor === endVertex || !space.vertices.includes(neighbor));



                const centroid = space.getCentroid(this.vertices);

                validNeighbors.forEach(neighbor => {
                    const distanceToCentroid = this.getDistanceToCentroid(currentVertex, centroid);
                    const alt = distances[currentVertex] + distanceToCentroid;
                    if (alt < distances[neighbor]) {
                        distances[neighbor] = alt;
                        previous[neighbor] = currentVertex;
                        pq.enqueue(neighbor);
                    }
                });


        }
    
        return null; // No path found
    }

    findSpacesContainingEdge(edgeId) {
        const spacesContainingEdge = [];

        this.spaces.forEach(space => {
            if (space.edges.includes(edgeId)) {
                spacesContainingEdge.push(space);
            }
        });
        return spacesContainingEdge;
    }

    isSpaceClosed(space) {
        if (space.vertices.length < 3) {
            return false; // A closed space must have at least 3 vertices
        }
    
        // An opening exists when a vertex doesn't have 2 neighbours in the set of vertices in the space.
        const openingVertices = [];
        space.vertices.forEach(vertex => {
            const neighbors = this.getVertexNeighbors(vertex, space.edges);
            if (neighbors.length !== 2) {
                openingVertices.push(vertex);
            }
        });
    
        // You typically a list of 2 vertices that create the opening.
        return openingVertices.length === 0 ? true : openingVertices;
    }

    findEdgeIdByVertexIds(id1, id2) {
        for (let edge in this.edges) {
            if ((this.edges[edge].v1.id == id1 && this.edges[edge].v2.id == id2) || (this.edges[edge].v1.id == id2 && this.edges[edge].v2.id == id1)) {
                return edge;
            }
        }
        return undefined;
    }
    
    addVertex(x, y) {
        let vfound = this.findVertexIdByCoords(x, y);
        if (vfound) {
            return parseInt(vfound);
        } else {
            let id = this.vertices.length;
            let vertex = new Vertex(id, x, y);
            this.vertices.push(vertex);
            return id;
        }
    }

    addEdgeByVertexIds(vId1, vId2) {
        let efound = this.findEdgeIdByVertexIds(vId1, vId2);
        if (efound) {
            return parseInt(efound);
        } else {
            let id = this.edges.length;
            let edge = new Edge(id, this.vertices[vId1], this.vertices[vId2]);
            this.edges.push(edge);
            return id;
        }

    }

    adjustEdgeByVertex(edgeId, vertexId) {
        // Resets a vertex on an edge in case of overlapping edges
        let edge = this.edges[edgeId];
        let vertex = this.vertices[vertexId];

        if (this.findEdgeIdByVertexIds(edge.v1.id, vertexId)) {
            edge.v1 = vertex;
        } else if (this.findEdgeIdByVertexIds(edge.v2.id, vertexId)) {
            edge.v2 = vertex;
        }
    }

    addSpace(coordArray, name) {

        // Find the top-left vertex and sort the vertices in a clockwise direction relative to the top-left vertex
        coordArray.sort((a, b) => a.y - b.y || a.x - b.x);
        const topLeft = coordArray[0];

        coordArray = coordArray.sort((a, b) => {
            const angleA = Math.atan2(a.y - topLeft.y, a.x - topLeft.x);
            const angleB = Math.atan2(b.y - topLeft.y, b.x - topLeft.x);
            return angleA - angleB;
        });

        let spaceVerts = [];
        let spaceEdges = [];
        for (let coord in coordArray) {
            let vfound = this.findVertexIdByCoords(coordArray[coord].x, coordArray[coord].y);
            
            if (vfound) {
                spaceVerts.push(parseInt(vfound));
            } else {
                let vId = this.addVertex(coordArray[coord].x, coordArray[coord].y);
                spaceVerts.push(vId);

                // Check if the newly created vertex falls on an existing edge.
                // This means the edge should be split and affected spaces should be updated.
                this.edges.forEach(edge => {
                    if (this.isVertexOnEdge(this.vertices[vId], edge)) {
                        this.edgesToAdjust.push([edge.id, vId]); // push edge id and vertex id for later splitting
                        this.spacesToUpdate.push(...this.findSpacesContainingEdge(edge.id));
                    }
                });
                this.spacesToUpdate = [ ...new Set(this.spacesToUpdate) ]
            }
        }

        for (let i = 0; i < spaceVerts.length; i++) {
            let vId1 = spaceVerts[i];
            let vId2 = spaceVerts[(i + 1) % spaceVerts.length];
            let eId = this.addEdgeByVertexIds(vId1, vId2);
            spaceEdges.push(eId);
        }
        let sId = this.spaces.length;
        let newSpace = new Space(sId, name, spaceVerts, spaceEdges);
        this.spaces.push(newSpace);
        
        this.updateEdges();
        this.updateSpaces();
    }

    updateEdges() {
        while (this.edgesToAdjust.length) {
            let edgeToAdjust = this.edgesToAdjust.pop();
            this.adjustEdgeByVertex(edgeToAdjust[0], edgeToAdjust[1]); // edgeToAdjust[0] is the edge id, edgeToAdjust[1] is the vertex id
        }
    }

    updateSpaceVertsByEdges(space) {
        const verticesSet = new Set();
        space.edges.forEach(edgeId => {
            const edge = this.edges[edgeId];
            verticesSet.add(edge.v1.id);
            verticesSet.add(edge.v2.id);
        });
        space.vertices = Array.from(verticesSet);
    }

    updateSpaceEdgesByVerts(space) {
        const newEdges = [];
        const vertices = space.vertices;

        for (let i = 0; i < vertices.length; i++) {
            const vId1 = vertices[i];
            const vId2 = vertices[(i + 1) % vertices.length]; // Wrap around to the first vertex
            const edgeId = this.findEdgeIdByVertexIds(vId1, vId2) || this.addEdgeByVertexIds(vId1, vId2);
            newEdges.push(parseInt(edgeId));
        }

        space.edges = newEdges;
    }

    updateSpaces() {
        while (this.spacesToUpdate.length) {
            let spaceToUpdate = this.spacesToUpdate.pop();
            // First, make sure the vertices are set correctly based on new edges.
            this.updateSpaceVertsByEdges(spaceToUpdate);
            // Second, close the space if it is not closed and update its vertices and edges.
            const spaceClosed = this.isSpaceClosed(spaceToUpdate);
            if (spaceClosed !== true) {
                const path = this.findSpaceClosingPath(spaceClosed[0], spaceClosed[1], spaceToUpdate);
                spaceToUpdate.vertices.push(...path);
                spaceToUpdate.vertices = [...new Set(spaceToUpdate.vertices)];

                // Put this function in a nice place somewhere
                function sortVerticesClockwise(vertices, vertArray) {
                    const centroid = getCentroid(vertices, vertArray);
                
                    return vertices.sort((a, b) => {
                        const angleA = Math.atan2(vertArray[a].y - centroid.y, vertArray[a].x - centroid.x);
                        const angleB = Math.atan2(vertArray[b].y - centroid.y, vertArray[b].x - centroid.x);
                        return angleA - angleB;
                    });
                }
                // Put this function in a nice place somewhere
                function getCentroid(vertices, vertArray) {
                    let xSum = 0;
                    let ySum = 0;
                    vertices.forEach(vId => {
                        xSum += vertArray[vId].x;
                        ySum += vertArray[vId].y;
                    });
                    return { x: xSum / vertices.length, y: ySum / vertices.length };
                }
                
                spaceToUpdate.vertices = sortVerticesClockwise(spaceToUpdate.vertices, this.vertices);

                this.updateSpaceEdgesByVerts(spaceToUpdate); 
            }
        } 
    }

    toJson() {
        let json = {
            "spatialGraph": {
                "vertices": this.vertices,
                "edges": this.edges.map(edge => {
                    return {"id": edge.id, "vertices": [edge.v1.id, edge.v2.id]};
                }),
                "spaces": this.spaces
            }
        }
        return JSON.stringify(json);
    }
}


class PriorityQueue {
    constructor(comparator = (a, b) => a > b) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    peek() {
        return this._heap[0];
    }

    enqueue(value) {
        this._heap.push(value);
        this._siftUp();
    }

    dequeue() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }

    _greater(i, j) {
        return this._comparator(this._heap[i], this._heap[j]);
    }

    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }

    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._greater(node, Math.floor((node - 1) / 2))) {
            this._swap(node, Math.floor((node - 1) / 2));
            node = Math.floor((node - 1) / 2);
        }
    }

    _siftDown() {
        let node = 0;
        while (
            (node * 2 + 1 < this.size() && this._greater(node * 2 + 1, node)) ||
            (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node))
        ) {
            let maxChild = (node * 2 + 2 < this.size() && this._greater(node * 2 + 2, node * 2 + 1)) ? node * 2 + 2 : node * 2 + 1;
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}


// Export the classes
export { Vertex, Edge, Space, SpatialGraph };