import './webui/colors.css'
import './main.css'
import { STRINGS, setupLanguage } from './language/default'
import { Notepad } from './scratchpad/notepad'

async function main() {
    // Remove 'sp_*' stuff from old versions of scratchpad.
    for (let x in localStorage) {
        if (x.startsWith("sp_") && x != "sp_file") {
            delete localStorage[x]
        }
    }
    // Setup language and instantiate notepad and add it to the demo app.
    setupLanguage()
    let notepad = new Notepad(localStorage["sp_file"], "", false)
    notepad.onSave = (spf: string) => {localStorage["sp_file"] = spf}
    notepad.onBack = () => {alert("This should not happen!")}
    document.addEventListener('keydown', (e: KeyboardEvent) => {
        // CTRL + S to save document
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault()
            notepad.save()
        }
    });

    document.getElementsByTagName("title")[0].innerHTML = STRINGS.APPNAME
    document.getElementById("app")!.appendChild(notepad.htmlElement)
}

main()
