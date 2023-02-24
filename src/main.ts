import './colors/color-blue.css'
import './main.css'
import { Toolbar } from './toolbar/toolbar'
import { PagePreview } from './page_preview/page_preview'
import { Notepad } from './notepad/notepad'

let SCRATCHPAD_LOGO = '<img src="/favicon.ico" class="logo" alt="ScratchPad logo" />'


function createElement(type: string, attribute: any) {
  let element = document.createElement("div")
  for (var key in attribute) {
    element.setAttribute(key, attribute[key]);
  }
  return element
}

function main() {
  let app = document.querySelector<HTMLDivElement>('#app')!
  let pagePreview = new PagePreview(createElement("div", {"id": "page_preview"}))
  let notepad = new Notepad(createElement("div", {"id": "notepad"}))
  let toolbar = new Toolbar(createElement("div", {"id": "toolbar"}))
  app.appendChild(toolbar.mainDiv)
  app.appendChild(pagePreview.mainDiv)
  app.appendChild(notepad.mainDiv)
}

main()
