import "./page_preview.css"


export class PagePreview {
  constructor(private mainDiv: HTMLDivElement) {
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      mainDiv.innerHTML = `count is ${counter}`
    }
    mainDiv.addEventListener('click', () => setCounter(counter + 1))
    setCounter(0)
  }

  public toggleVisibility() {
    if (this.mainDiv.classList.contains("no-width")) {
      this.mainDiv.classList.remove("no-width")
    } else {
      this.mainDiv.classList.add("no-width")
    }
  }
}
  