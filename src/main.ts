import './webui/colors.css'
import './main.css'
import { PageManager } from './webui/pagemanager'
import { STRINGS, setupLanguage } from './language/default'
import { Notepad } from './notepad/notepad'

async function main() {
  for (let x in localStorage) {
    if (x.startsWith("sp_") && x != "sp_file") {
      delete localStorage[x]
    }
  }
  setupLanguage()
  document.getElementsByTagName("title")[0].innerHTML = STRINGS.APPNAME
  let notepad = new Notepad()
  new PageManager(
    "notepad",
    {
      notepad: notepad,
      overview: notepad // for backwards compatibility forward overview to notepad
    }
  )
}

main()