import './toolbar.css'
import { PagePreview } from '../page_preview/page_preview'
import { Notepad } from '../notepad/notepad'

export class Toolbar{
  public constructor(
        private element: HTMLDivElement,
        private notepad: Notepad,
        private pagePreview: PagePreview) {
    let counter = 0
    const setCounter = (count: number) => {
      counter = count
      element.innerHTML = `count is ${counter}`
      if (count>0) {
        pagePreview.toggleVisibility()
        notepad.toggleFullWidth()
      }
    }
    element.addEventListener('click', () => setCounter(counter + 1))
    setCounter(0)
  }
}
