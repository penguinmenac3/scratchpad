import { Module } from '../../webui/module';
import { iconErasor } from './toolbar/icons';
import { StaticTool } from './abstractTools';


export class Erasor extends StaticTool {
    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconErasor, "erasor")
    }
}
