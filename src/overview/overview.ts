import "./overview.css"
import { KWARGS, Module } from '../webui/module'
import { PageManager } from "../webui/pagemanager";
import { ConfirmCancelPopup, ExitablePopup } from "../webui/popup";
import { Button, FormInput } from "../webui/form";

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
}

export class Overview extends Module<HTMLDivElement> {
    private fileList: Module<HTMLDivElement>

    constructor() {
        super("div", "", "overview")
        this.fileList = new Module<HTMLDivElement>("div")
        this.add(this.fileList)
    }
    public update(_kwargs: KWARGS, _changedPage: boolean): void {
        this.fileList.htmlElement.innerHTML = ""
        this.fileList.add(new FileEntry("NEW"))
        if (localStorage.sp_files) {
            let files = JSON.parse(localStorage.sp_files)
            files = files.filter(notEmpty)
            // Sort reversed, so newest date is at top
            files.sort((a: string, b: string) => b.localeCompare(a))
            for (let fname of files) {
                this.fileList.add(new FileEntry(fname))
            }
        }
    }
}

export class FileEntry extends Module<HTMLDivElement> {
    constructor(fname: string) {
        super("div", "", "overviewFileEntry")
        this.add(new FilePreview(fname))
        let displayName = fname.slice(0, fname.length-4)
        if (fname != "NEW") {
            this.add(new Module<HTMLDivElement>("div", displayName.replaceAll("_", " "), "overviewFileName"))
        }
        let clickable = new Module<HTMLDivElement>("div", "", "overviewFileEntryHover")
        clickable.htmlElement.onclick = () => {
            PageManager.open("notepad", {file: fname})
        }
        this.add(clickable)
        if (fname != "NEW") {
            this.add(new FileSettings(displayName))
        }
    }
}

export class FilePreview extends Module<HTMLDivElement> {
    constructor(fname: string) {
        super("div", "", "overviewFilePreview")
        if (fname == "NEW") {
            this.htmlElement.innerHTML = "+"
        } else {
            this.htmlElement.innerHTML = ""
        }
    }
}

export class FileSettings extends Module<HTMLDivElement> {
    constructor(private fname: string) {
        super("div", "o", "overviewFileSettings")
        this.htmlElement.onclick = this.onClick.bind(this)
    }

    onClick() {
        let popup = new ExitablePopup("overviewFileSettingsPopupInner", "overviewFileSettingsPopupOuter", "overviewFileSettingsPopupExitBtn")
        popup.add(new Module<HTMLDivElement>("div", this.fname, "overviewFileSettingsPopupTitle"))
        let input = new FormInput("fname", this.fname, "text", "overviewFileSettingsPopupInput")
        input.value(this.fname)
        popup.add(input)
        let renameBtn = new Button("Rename", "overviewFileSettingsPopupRenameBtn")
        popup.add(renameBtn)
        renameBtn.onClick = () => {
            let name = input.value()
            if (name == "") {
                return
            }
            if (name.indexOf("/") >= 0) {
                alert("/ not allowed in filename.")
                return
            }
            if (name.indexOf(":") >= 0) {
                alert(": not allowed in filename.")
                return
            }
            popup.dispose()
            let files = JSON.parse(localStorage.sp_files)
            files = files.filter(notEmpty)
            let idx = files.indexOf(this.fname + ".spf")
            files.splice(idx, 1)
            files.push(name + ".spf")
            localStorage.sp_files = JSON.stringify(files)
            localStorage["sp_file_" + name + ".spf"] = localStorage["sp_file_" + this.fname + ".spf"]
            delete localStorage["sp_file_" + this.fname + ".spf"]
            location.reload()
        }
        popup.add(new Module<HTMLDivElement>("hr", "", "overviewFileSettingsPopupSeparator"))
        let deleteBtn = new Button("Delete", "overviewFileSettingsPopupDeleteBtn")
        popup.add(deleteBtn)
        deleteBtn.onClick = () => {
            popup.dispose()
            new ConfirmCancelPopup(
                "overviewFileSettingsPopupInner",
                "overviewFileSettingsPopupOuter",
                "Are you sure you want to delete " + this.fname + "?",
                "Keep", "Delete"
            ).onCancel = () => {
                let files = JSON.parse(localStorage.sp_files)
                files = files.filter(notEmpty)
                let idx = files.indexOf(this.fname + ".spf")
                files.splice(idx, 1)
                localStorage.sp_files = JSON.stringify(files)
                delete localStorage["sp_file_" + this.fname + ".spf"]
                location.reload()
            }
        }
    }
}
