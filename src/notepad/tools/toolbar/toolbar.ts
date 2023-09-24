import './toolbar.css'
import { ToolButton } from './toolbutton'
import { Spacer } from './spacer'
import { Module } from '../../../webui/module'
import { iconArrowLeft, iconFinger, iconRedo, iconUndo } from './icons'
import { iconBars } from '../../../webui/icons/icons'
import { Tool } from '../../interfaces'
import { Pen } from '../pen'
import { Marker } from '../marker'
import { Erasor } from '../erasor'
import { Text } from '../text'
import { Select } from '../select'
import { InsertSpace } from '../insertSpace'
import { Image } from '../image'


export class Toolbar extends Module<HTMLDivElement> {
  public constructor(tools: Map<string, Tool>) {
    super("div", "", "toolbar")
    this.add(new ToolButton("back", false, iconArrowLeft))
    this.add(new Spacer())
    new Pen(this).register(tools)
    new Marker(this).register(tools)
    new Erasor(this).register(tools)
    new Text(this).register(tools)
    new Select(this).register(tools)
    new InsertSpace(this).register(tools)
    new Image(this).register(tools)
    this.add(new Spacer())

    this.add(new ToolButton("settings_document", false, iconBars, true))
    this.add(new Spacer(true))
    this.add(new ToolButton("redo", false, iconRedo, true))
    this.add(new ToolButton("undo", false, iconUndo, true))
    this.add(new Spacer(true))
    this.add(new ToolButton("touchToggle", false, iconFinger, true, true))
    //this.add(new Spacer(true))
  }
}
