import './toolbar.css'
import { MenuPopup, ToolButton, ToolMenuButton } from './toolbutton'
import { Spacer } from './spacer'
import { Module } from '../../../webui/module'
import { iconArrowLeft, iconExport, iconFinger, iconImport, iconSave, iconTrash } from './icons'
import { Tool } from '../../interfaces'
import { Pen } from '../pen'
import { Marker } from '../marker'
import { Erasor } from '../erasor'
//import { Select } from '../select'
import { InsertSpace } from '../insertSpace'
//import { Image } from '../image'
import { Event, Eventbus } from '../../../webui/eventbus'
import { iconBars } from '../../../webui/icons/icons'


export class Toolbar extends Module<HTMLDivElement> {
  public constructor(tools: Map<string, Tool>, hasBack: boolean) {
    super("div", "", "toolbar")
    if (hasBack) {
      this.add(new ToolButton("back", false, iconArrowLeft))
    }
    let saveButton = new ToolButton("save", false, iconSave)
    Eventbus.register("save", (_topic: string, event: Event) => {
      if (event.type == "saved") {
        saveButton.htmlElement.style.fill = "var(--color-brand-c1)"
      } else {
        saveButton.htmlElement.style.fill = "var(--color-bad-font)"
      }
    })
    this.add(saveButton)
    this.add(new Spacer())
    new Pen(this).register(tools)
    new Marker(this).register(tools)
    new Erasor(this).register(tools)
    //new Select(this).register(tools)
    new InsertSpace(this).register(tools)
    //new Image(this).register(tools)

    let menu = new ToolButton("menu", false, iconBars, true, false)
    menu.addPopup(new MenuPopup([
      new ToolMenuButton("clear", iconTrash, "Clear"),
      new ToolMenuButton("export", iconExport, "Export"),
      new ToolMenuButton("import", iconImport, "Import"),
    ]))
    this.add(menu)
    //this.add(new ToolButton("redo", false, iconRedo, true))
    //this.add(new ToolButton("undo", false, iconUndo, true))
    //this.add(new Spacer(true))
    this.add(new ToolButton("touchToggle", false, iconFinger, true, true))
  }
}
