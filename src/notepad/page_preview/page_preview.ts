import { Event, Eventbus } from "../../eventbus"
import "./page_preview.css"
import { createElement } from '../../helpers'


export class PagePreview {
  private mainDiv: HTMLDivElement
  constructor(parent: HTMLDivElement) {
    this.mainDiv = createElement("div", {"id": "page_preview"})
    parent.appendChild(this.mainDiv)
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      this.mainDiv.innerHTML = `count is ${counter}`
    }
    this.mainDiv.addEventListener('click', () => setCounter(counter + 1))
    setCounter(0)
    Eventbus.register("toolbar/change", this.toggleVisibility.bind(this))
  }

  private toggleVisibility(topic: string, event: Event) {
    if (event.type == "string" && event.data == "togglePreview") {
      if (this.mainDiv.classList.contains("no-width")) {
        this.mainDiv.classList.remove("no-width")
      } else {
        this.mainDiv.classList.add("no-width")
      }
    }
  }
}
