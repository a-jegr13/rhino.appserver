import * as Globals from './globals.js';




export class Wall {
    constructor(container, startX, startY, endX, endY, color = 0x6C5A49, width = 10) {
        this.container = container
        this.startX = startX
        this.startY = startY
        this.endX = endX
        this.endY = endY
        this.color = color
        this.width = width
        this.graphics = this.draw()
        this.active = false;
        this.marker = new PIXI.Graphics();
    }

    getClosestPointOnLine(x, y) {
        const dx = this.endX - this.startX;
        const dy = this.endY - this.startY;
        const lengthSquared = dx * dx + dy * dy;
        const t = ((x - this.startX) * dx + (y - this.startY) * dy) / lengthSquared;
        return Math.max(0, Math.min(1, t));
    }

    draw() {
        const graphics = new PIXI.Graphics()
        .moveTo(this.startX, this.startY)
        .lineTo(this.endX, this.endY)
        .stroke({texture: PIXI.Texture.WHITE,  width: this.width, color: this.color});
    
        graphics.on('pointerdown', this.onPointerDown.bind(this));
        graphics.on('pointerover', this.onPointerOver.bind(this));
        graphics.on('pointerout', this.onPointerOut.bind(this));
        graphics.on('pointermove', this.onPointerMove.bind(this));

        graphics.eventMode = 'static';
        this.container.addChild(graphics);
        return graphics;
    }


    onPointerDown(event) {
        this.graphics.clear()
        this.color = 0xff0000;
        this.graphics = this.draw();
    }

    onPointerOver(event) {
        this.active = true;   
    }

    onPointerOut(event) {
        this.active = false;
        this.marker.clear();
    }

    onPointerMove(event) {
        if (this.active) {
            const newPosition = event.data.getLocalPosition(this.container);
            const t = this.getClosestPointOnLine(newPosition.x, newPosition.y);
            const markerX = this.startX + t * (this.endX - this.startX);
            const markerY = this.startY + t * (this.endY - this.startY);
    
            this.marker.clear();
            this.marker.circle(markerX, markerY, 10);
            this.marker.fill(0x00ff00);
            this.container.addChild(this.marker);
        }
    }


}

export class Room {
    constructor(container, space, color = 0x6C5A49) {
        this.container = container
        this.space = space
        this.color = color
        this.graphics = this.draw()
    }

    draw() {

        // Draw walls
        this.space.edges.forEach(edgeIndex => {
            const edge = Globals.spatialGraph.edges[edgeIndex];
            const wall = new Wall(this.container, edge.v1.x, edge.v1.y, edge.v2.x, edge.v2.y);
            
        if (Globals.graphInfoMode) {
            this.drawVertexInfo();
            this.drawEdgeInfo(edge.v1.x, edge.v1.y, edge.v2.x, edge.v2.y, edgeIndex);
        }
    });


        // Draw room info
        const centroid = this.space.getCentroid(Globals.spatialGraph.vertices);
        const text = new PIXI.Text({
            text:`${this.space.name}\n ${this.space.getArea(Globals.spatialGraph.vertices)} m²`,
            style: new PIXI.TextStyle({

                fill: 0x000000,
                fontSize: 20,
                wordWrap: true,
                wordWrapWidth: 200,
                align: 'center'
            })
          });
          text.x = centroid.x - text.width / 2;
          text.y = centroid.y - text.height / 2;
        this.container.addChild(text);
    }

    drawVertexInfo() {
        this.space.vertices.forEach(vertexIndex => {
            const vertex = Globals.spatialGraph.vertices[vertexIndex];
            const graphics = new PIXI.Graphics();
            graphics.beginFill(0xFFFFFF);
            graphics.lineStyle(2, 0x00FF00); // Green border
            graphics.drawCircle(vertex.x, vertex.y, 15);
            graphics.endFill();

            const text = new PIXI.Text(vertex.id, { fill: 'green', fontSize: 20 });
            text.x = vertex.x - text.width / 2;
            text.y = vertex.y - text.height / 2;

            this.container.addChild(graphics);
            this.container.addChild(text);
        });
    }

    drawEdgeInfo(startX, startY, endX, endY, edgeIndex) {
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const text = new PIXI.Text(edgeIndex, { fill: 'red', fontSize: 20 });
        const padding = 5;
        const background = new PIXI.Graphics();
        background.beginFill(0xFFFFFF);
        background.lineStyle(2, 0xFF0000);
        background.drawRect(midX - text.width / 2 - padding, midY - text.height / 2 - padding, text.width + 2 * padding, text.height + 2 * padding);
        background.endFill();

        this.container.addChild(background);
        text.x = midX - text.width / 2;
        text.y = midY - text.height / 2;
        this.container.addChild(text);
    }
}