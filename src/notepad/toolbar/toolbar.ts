import './toolbar.css'
import { ToolButton, ToolPopup } from './toolbutton'
import { Spacer } from './spacer'
import { Module } from '../../webui/module'
import { iconArrowLeft, iconErasor, iconMarker, iconPen, iconRectangle, iconRedo, iconSave, iconSelect, iconSplit, iconText, iconUndo } from './icons'
import { iconBars } from '../../webui/icons/icons'


export class Toolbar extends Module<HTMLDivElement> {
  public constructor() {
    super("div", "", "toolbar")
    this.add(new ToolButton("back", false, iconArrowLeft))
    this.add(new ToolButton("togglePreview", false, iconSplit))
    this.add(new ToolButton("save", false, iconSave))
    this.add(new Spacer())
    let pen = new ToolButton("tool_pen", true, iconPen)
    pen.onClick()
    pen.addPopup(new ToolPopup())
    this.add(pen)
    let marker = new ToolButton("tool_marker", true, iconMarker)
    marker.addPopup(new ToolPopup())
    this.add(marker)
    let erasor = new ToolButton("tool_erasor", true, iconErasor)
    erasor.addPopup(new ToolPopup())
    this.add(erasor)
    let text = new ToolButton("tool_text", true, iconText)
    text.addPopup(new ToolPopup())
    this.add(text)
    this.add(new Spacer())
    let shape = new ToolButton("tool_shape", true, iconRectangle)
    shape.addPopup(new ToolPopup())
    this.add(shape)
    let select = new ToolButton("tool_select", true, iconSelect)
    select.addPopup(new ToolPopup())
    this.add(select)

    this.add(new ToolButton("settings_document", false, iconBars, true))
    this.add(new Spacer(true))
    this.add(new ToolButton("redo", false, iconRedo, true))
    this.add(new ToolButton("undo", false, iconUndo, true))
    //this.add(new Spacer(true))
  }
}
