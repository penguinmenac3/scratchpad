export class English {
    protected constructor() {}

    public static APPLY_COUNTED(num: number, format: string): string {
        return format.replace("{count}", num.toString())
    }

    public static TIME_LOCALE = "en"
    public static TIME_YESTERDAY = "yesterday"
    public static TIME_HOURS_AGO = "{count} hour(s) ago"
    public static TIME_MINUTES_AGO = "{count} minute(s) ago"
    public static TIME_SECONDS_AGO = "{count} second(s) ago"
    public static TIME_TODAY_AT = "today at"
    public static TIME_JUST_NOW = "just now"

    public static APPNAME = "ScratchPad"

    public static LOGIN_KNOWN_CONNECTIONS = "Reuse Connection"
    public static LOGIN_ALL_CONNECTIONS = "All"
    public static LOGIN_SESSION_NAME = "Session Name"
    public static LOGIN_API_ENDPOINT_LABEL = "API Endpoint URL"
    public static LOGIN_API_TOKEN_LABEL = "API Token"
    public static LOGIN_SUBMIT = "Add Connection"
    public static LOGIN_ERROR_MISSING_INPUTS = "You must provide all fields (session name, api endpoint and api token)."
    public static LOGIN_ERROR_LOGIN_FAILED = "The provided login information is wrong. Is the URL and API token correct?"
    
    public static LOGIN_OFFLINE_MODAL_QUESTION = "Cannot connect to server. Do you want to continue in offline mode? Offline mode might show you outdated files and data."
    public static LOGIN_OFFLINE_MODAL_CONFIRM = "Continue offline"
    public static LOGIN_OFFLINE_MODAL_CANCEL = "Return to login"

    public static NOTEPAD_CLEAR_QUESTION = "Are you sure you want to clear the document? This will delete all strokes and content of it irreversibly!"
    public static NOTEPAD_CLEAR_CONFIRM = "Yes, delete it"
    public static NOTEPAD_CLEAR_CANCEL = "No, keep it"

    public static NOTEPAD_IMPORT_QUESTION = "What file do you want to import (*.spf.svg or *.spf)? Note: Importing will overwrite content currently displayed."
    public static NOTEPAD_IMPORT_CONFIRM = "Import"
    public static NOTEPAD_IMPORT_UNSUPPORTED_FILE = "ERROR: Only *.spf and *.spf.svg are supported filetypes."
}
