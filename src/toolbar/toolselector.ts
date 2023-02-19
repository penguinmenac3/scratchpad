import { Eventbus } from "../eventbus"

export class ToolSelector {
    protected element: HTMLDivElement
    
    public constructor(protected toolbar: HTMLDivElement,  protected id: string)
    {
        toolbar.innerHTML += `<div class="tool" id="${id}"></div>`
        this.element = document.querySelector<HTMLDivElement>(`#${id}`)!
        this.setContent(`id_${id}`)

        this.element.addEventListener('click', (e) => {
            Eventbus.send("toolbar/change", {
                "type": "string", "data": id, "allowNetwork": false
            })
            return true
        })
    }

    protected setContent(html: string) {
        this.element.innerHTML = html
    }
}
