import "./page_preview.css"
import { Event, Eventbus } from "../../webui/eventbus"
import { Module } from "../../webui/module"


export class PagePreview extends Module<HTMLDivElement>{
  constructor() {
    super("div", "", "notepad-pagePreview")
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      this.htmlElement.innerHTML = `count is ${counter}`
    }
    this.htmlElement.onclick = (_ev: MouseEvent) => setCounter(counter + 1)
    setCounter(0)
    Eventbus.register("toolbar/change", this.toggleVisibility.bind(this))
  }

  private toggleVisibility(_topic: string, event: Event) {
    if (event.type == "string" && event.data == "togglePreview") {
      if (this.isVisible()) {
        this.hide()
      } else {
        this.show()
      }
    }
  }
}
