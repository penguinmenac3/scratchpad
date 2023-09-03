import './toolbar.css'
import { ToolButton, ToolColorSetting, ToolPopup, ToolSetting, ToolSizeSetting } from './toolbutton'
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
    pen.addPopup(new ToolPopup([
      new ToolColorSetting(iconPen, "base"),
      new ToolColorSetting(iconPen, "brand", true),
      new ToolColorSetting(iconPen, "accent"),
      new ToolColorSetting(iconPen, "good"),
      new ToolColorSetting(iconPen, "bad"),
      new ToolSizeSetting("o", 1),
      new ToolSizeSetting("O", 5),
    ]))
    this.add(pen)
    let marker = new ToolButton("tool_marker", true, iconMarker)
    marker.addPopup(new ToolPopup([
      new ToolColorSetting(iconMarker, "base"),
      new ToolColorSetting(iconMarker, "brand"),
      new ToolColorSetting(iconMarker, "accent", true),
      new ToolColorSetting(iconMarker, "good"),
      new ToolColorSetting(iconMarker, "bad"),
      new ToolSizeSetting("o", 20),
      new ToolSizeSetting("O", 40),
    ]))
    this.add(marker)
    let erasor = new ToolButton("tool_erasor", true, iconErasor)
    erasor.addPopup(new ToolPopup())
    this.add(erasor)
    let text = new ToolButton("tool_text", true, iconText)
    text.addPopup(new ToolPopup([
      new ToolColorSetting(iconText, "base", true),
      new ToolColorSetting(iconText, "brand"),
      new ToolColorSetting(iconText, "accent"),
      new ToolColorSetting(iconText, "good"),
      new ToolColorSetting(iconText, "bad"),
      new ToolSizeSetting("Tv", 1),
      new ToolSizeSetting("T^", 2),
    ]))
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
