export function svgAddHeader(svg: string, width: number, height: number): string {
    return '<svg width="' + width + '" height="' + height + '" xmlns="http://www.w3.org/2000/svg">\n' + 
        svg + '</svg>'
}

export function svgEncodePolyline(points: number[][], color:string, width: number): string {
    let pointsStr: string[] = []
    for (let point of points) {
        pointsStr.push(point[0] + "," + point[1])
    }
    return '<polyline points="' + 
        pointsStr.join(" ") +
        '" style="fill:none;stroke:' + color +
        ';stroke-width:' + width + '" />\n'
}

export function svgEncodeSPFComment(spf: string): string {
    return '<!--\n' + spf + "\n-->\n"
}
