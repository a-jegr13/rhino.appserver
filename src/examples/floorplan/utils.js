export function getPolygons(data) {
    let polyList = [];
    if (data.children) {
        for (let node of data.children) {
            let childrenPolys = getPolygons(node);
            polyList = polyList.concat(childrenPolys);
        }
    }
    polyList = polyList.concat([data["polygon2d"]]);
    return polyList;
}

export function parseWKTPolygon(wkt) {
    const prefix = 'POLYGON ((';
    const suffix = '))';
    if (!wkt.startsWith(prefix) || !wkt.endsWith(suffix)) {
        throw new Error('Invalid WKT string');
    }
    const coordinatesString = wkt.slice(prefix.length, -suffix.length);
    const coordinates = coordinatesString.split(',').map(coordinate => {
        const [x, y] = coordinate.trim().split(' ').map(Number);
        return { x, y };
    });
    return coordinates;
}

export function isPointOnLine(x1, y1, x2, y2, x, y) {
    // Check if a point is on a line segment between two points

    // Calculate cross product
    let crossProduct = (y - y1) * (x2 - x1) - (x - x1) * (y2 - y1);
    if (Math.abs(crossProduct) > Number.EPSILON) {
        return false;
    }

    // Calculate dot product
    let dotProduct = (x - x1) * (x2 - x1) + (y - y1)*(y2 - y1);
    if (dotProduct < 0) {
        return false;
    }

    // Calculate squared length of the line segment
    let squaredLength = Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2);
    if (dotProduct > squaredLength) {
        return false;
    }

    return true;
}



