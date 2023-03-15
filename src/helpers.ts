export function createElement<T>(type: string, attribute: any): T {
    let element = document.createElement(type)
    for (var key in attribute) {
        element.setAttribute(key, attribute[key]);
    }
    return element as T
}


export class Containered {
    protected container: HTMLDivElement
    
    constructor(parent: HTMLDivElement) {
        this.container = createElement<HTMLDivElement>("div", {"class": "container"})
        parent.appendChild(this.container)
    }

    protected resizeHandler() {}

    public setVisibility(visible: boolean): void {
        if (visible && this.container.classList.contains("hidden")) {
            this.container.classList.remove("hidden")
            window.setTimeout(this.resizeHandler.bind(this), 100)
        }
        if (!visible && !this.container.classList.contains("hidden")) {
            this.container.classList.add("hidden")
        }
    }
}
