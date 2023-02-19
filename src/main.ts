import './colors/color-blue.css'
import './main.css'
import { Toolbar } from './toolbar/toolbar'
import { PagePreview } from './page_preview/page_preview'
import { Notepad } from './notepad/notepad'

let SCRATCHPAD_LOGO = '<img src="/favicon.ico" class="logo" alt="ScratchPad logo" />'


function main() {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="toolbar"></div>
  <div id="page_preview"></div>
  <div id="notepad"></div>
`
  let pagePreview = new PagePreview(
    document.querySelector<HTMLDivElement>('#page_preview')!
  )

  let notepad = new Notepad(
    document.querySelector<HTMLDivElement>('#notepad')!
  )

  let toolbar = new Toolbar(
    document.querySelector<HTMLDivElement>('#toolbar')!
  )
}

main()
