// Point is defined as [x, y]
export type Point = number[]
// Line is defined as [point1, point2]
export type Line = Point[]
// BBox is defined as [point1, point2]
export type BBox = Point[]

export function getBBox(line: Line): BBox {
    let p1 = [
        Math.min(line[0][0], line[1][0]),
        Math.min(line[0][1], line[1][1])
    ]
    let p2 = [
        Math.max(line[0][0], line[1][0]),
        Math.max(line[0][1], line[1][1])
    ]
    return [p1, p2]
}

export function doBoundingBoxesIntersect(boxA: BBox, boxB: BBox): boolean {
    /**
     * Compute if two bounding boxes intersect.
     * 
     * Note that we expect the first point to be the upper left
     * and the second to be the bottom right point.
     */
    return boxA[0][0] <= boxB[1][0]
        && boxA[1][0] >= boxB[0][0]
        && boxA[0][1] <= boxB[1][1]
        && boxA[1][1] >= boxB[0][1]
}

export function doLinesIntersect(lineA: Line, lineB: Line): boolean {
    /**
     * Compute if two lines intersect.
     */

    const ACx = (lineB[0][0] - lineA[0][0])
    const ACy = (lineB[0][1] - lineA[0][1])
    const ABx = (lineA[1][0] - lineA[0][0])
    const ABy = (lineA[1][1] - lineA[0][1])
    const CDx = (lineB[1][0] - lineB[0][0])
    const CDy = (lineB[1][1] - lineB[0][1])

    // AB x CD
    const bottom = ABx * CDy - ABy * CDx
    if (bottom != 0) {
        // AC x CD
        const top1 = ACx * CDy - ACy * CDx
        // AC x AB
        const top2 = ACx * ABy - ACy * ABx
        const t1 = top1 / bottom
        const t2 = top2 / bottom
        if (0 <= t1 && t1 <= 1 && 0 <= t2 && t2 <= 1) {
            return true
        }
    }
    return false
}
