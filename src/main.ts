import './colors/color-blue.css'
import './main.css'
import { Notepad } from "./notepad/notepad"

//let SCRATCHPAD_LOGO = '<img src="/favicon.ico" class="logo" alt="ScratchPad logo" />'

function main() {
  let app = document.querySelector<HTMLDivElement>('#app')!
  let notepad = new Notepad(app, false)
  notepad.setVisibility(true)
}

main()
