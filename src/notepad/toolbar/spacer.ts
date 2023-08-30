import { Module } from "../../webui/module"

export class Spacer extends Module<HTMLDivElement> { 
    public constructor(right: boolean = false)
    {
        super("div", "", "spacer")
        if (right) {
            this.htmlElement.style.float = "right"
        }
    }
}
