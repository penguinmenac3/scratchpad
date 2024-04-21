import './toolbar.css'
import { ToolButton } from './toolbutton'
import { Spacer } from './spacer'
import { Module } from '../../../webui/module'
import { iconExport, iconFinger, iconImport, iconSave, iconTrash } from './icons'
import { Tool } from '../../interfaces'
import { Pen } from '../pen'
import { Marker } from '../marker'
import { Erasor } from '../erasor'
//import { Select } from '../select'
import { InsertSpace } from '../insertSpace'
//import { Image } from '../image'
import { Event, Eventbus } from '../../../webui/eventbus'


export class Toolbar extends Module<HTMLDivElement> {
  public constructor(tools: Map<string, Tool>) {
    super("div", "", "toolbar")
    let saveButton = new ToolButton("save", false, iconSave)
    Eventbus.register("save", (_topic: string, event: Event) => {
      if (event.type == "saved") {
        saveButton.htmlElement.style.fill = "var(--color-brand-c1)"
      } else {
        saveButton.htmlElement.style.fill = "var(--color-bad-font)"
      }
    })
    this.add(saveButton)
    new Pen(this).register(tools)
    new Marker(this).register(tools)
    new Erasor(this).register(tools)
    //new Select(this).register(tools)
    new InsertSpace(this).register(tools)
    //new Image(this).register(tools)
    this.add(new Spacer())
    this.add(new ToolButton("clear", false, iconTrash))

    this.add(new ToolButton("export", false, iconExport, true))
    this.add(new ToolButton("import", false, iconImport, true))
    this.add(new Spacer(true))
    //this.add(new ToolButton("redo", false, iconRedo, true))
    //this.add(new ToolButton("undo", false, iconUndo, true))
    //this.add(new Spacer(true))
    this.add(new ToolButton("touchToggle", false, iconFinger, true, true))
  }
}
