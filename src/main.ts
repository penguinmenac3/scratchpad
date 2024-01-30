import './webui/colors.css'
import './main.css'
import { PageManager } from './webui/pagemanager'
import { STRINGS, setupLanguage } from './language/default'
import { Notepad } from './notepad/notepad'
import { Overview } from './overview/overview'

async function main() {
  setupLanguage()
  document.getElementsByTagName("title")[0].innerHTML = STRINGS.APPNAME
  new PageManager(
    "notepad",
    {
      notepad: new Notepad(),
      overview: new Overview(),
    }
  )
}

main()