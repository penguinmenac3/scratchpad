import './colors/color-blue.css'
import './main.css'
import { setupToolbar } from './toolbar/toolbar'
import { setupPagePreview } from './page_preview/page_preview'
import { setupNotepad } from './notepad/notepad'

let SCRATCHPAD_LOGO = '<img src="/favicon.ico" class="logo" alt="ScratchPad logo" />'


document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="toolbar"></div>
  <div id="page_preview"></div>
  <div id="notepad"></div>
`

setupToolbar(document.querySelector<HTMLDivElement>('#toolbar')!)
setupPagePreview(document.querySelector<HTMLDivElement>('#page_preview')!)
setupNotepad(document.querySelector<HTMLDivElement>('#notepad')!)
