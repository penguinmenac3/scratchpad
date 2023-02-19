import './toolbar.css'
import { ToolSelector } from './toolselector'


export class Toolbar{
  public constructor(
        private element: HTMLDivElement) {
    element.innerHTML = ``
    new ToolSelector(element, "togglePreview")
  }
}
