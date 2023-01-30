import "./page_preview.css"

export function setupPagePreview(element: HTMLDivElement) {
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      element.innerHTML = `count is ${counter}`
    }
    element.addEventListener('click', () => setCounter(counter + 1))
    setCounter(0)
  }
  