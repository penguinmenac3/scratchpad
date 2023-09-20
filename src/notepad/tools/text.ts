import { Module } from '../../webui/module';
import { iconText } from './toolbar/icons';
import { ColorizableResizableTool } from './abstractTools';


export class Text extends ColorizableResizableTool {
    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconText, "text", "brand", 1, "FF", 1, 5)
    }
}
