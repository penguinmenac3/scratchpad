import { Event, Eventbus } from "../eventbus"
import "./page_preview.css"


export class PagePreview {
  constructor(public mainDiv: HTMLDivElement) {
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      mainDiv.innerHTML = `count is ${counter}`
    }
    mainDiv.addEventListener('click', () => setCounter(counter + 1))
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
