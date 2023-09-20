import { Module } from '../../webui/module';
import { iconRectangle } from './toolbar/icons';
import { StaticTool } from './abstractTools';


export class Select extends StaticTool {
    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconRectangle, "select")
    }
}
