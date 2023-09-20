import { Module } from '../../webui/module';
import { iconImage } from './toolbar/icons';
import { StaticTool } from './abstractTools';


export class Image extends StaticTool {
    constructor(toolbar: Module<HTMLDivElement>) {
        super(toolbar, iconImage, "image")
    }
}
