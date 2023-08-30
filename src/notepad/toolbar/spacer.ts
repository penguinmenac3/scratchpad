export class Spacer {
    protected element: HTMLDivElement
    
    public constructor(protected toolbar: HTMLDivElement,  right: boolean = false)
    {
        this.element = document.createElement("div")
        toolbar.appendChild(this.element)
        this.element.classList.add("spacer")
        if (right) {
            this.element.style.float = "right"
        }
    }

    protected setContent(html: string) {
        this.element.innerHTML = html
    }
}
