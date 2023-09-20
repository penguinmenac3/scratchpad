import { Module } from '../../webui/module';
import { iconUpDown } from './toolbar/icons';
import { StaticTool } from './abstractTools';


export class InsertSpace extends StaticTool {
    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconUpDown, "insertSpace")
    }
}
