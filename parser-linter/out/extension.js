'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    const collection = vscode.languages.createDiagnosticCollection('test');
    if (vscode.window.activeTextEditor) {
        DiagnosticCheck(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            DiagnosticCheck(editor.document, collection);
        }
    }));
    vscode.workspace.onDidSaveTextDocument((document) => {
        DiagnosticCheck(document, collection);
    });
}
exports.activate = activate;
function DiagnosticCheck(document, collection) {
    let diag = [];
    diag.push(...updateDiagnostics(document, collection));
    diag.push(...keywordValidator(document, collection));
    collection.set(document.uri, diag);
}
function updateDiagnostics(document, collection) {
    let diag = [];
    if (document) {
        let lines = document.getText().split('\n');
        let reg_match_regex = new RegExp(/(r\|.+?(\n|$))|REGEX *= *(.+?($|\n))/, 'ig');
        for (let index = 0; index < lines.length; index++) {
            let line = lines[index];
            var match = reg_match_regex.exec(line);
            console.log(match);
            if (!match) {
            }
            while (match) {
                let match_exp = '';
                if (match[3]) {
                    match_exp = match[3];
                }
                else {
                    match_exp = match[0].substring(2);
                }
                console.log(match);
                try {
                    let r = new RegExp(match_exp);
                }
                catch (exception) {
                    var message = exception.message;
                    diag.push({
                        code: '',
                        message: 'Not a Valid Regex',
                        range: new vscode.Range(new vscode.Position(index, match.index), new vscode.Position(index, match.index + match_exp.length)),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: '',
                        relatedInformation: [
                            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(index + 1, match.index), new vscode.Position(index + 1, match.index + match[0].length))), message)
                        ]
                    });
                }
                match = reg_match_regex.exec(line);
            }
        }
    }
    else {
        collection.clear();
    }
    return (diag);
}
function keywordValidator(document, collection) {
    let diag = [];
    if (document) {
        let lines = document.getText().split('\n');
        let reserved_keywords = ['IP Address', "Network", "MAC Address", "URL", "Hash", "Registry Key", "User", "Host Name", "File", "Geo Location"];
        for (let index = 0; index < lines.length; index++) {
            let line = lines[index];
            let reg_match_regex = new RegExp(/field_type\s*:[\<\>a-zA-Z0-9_\-]+=\s*([a-zA-Z_\-\\0-9 ]+)/, 'ig');
            var match = reg_match_regex.exec(line);
            while (match) {
                let match_exp = '';
                if (match[1]) {
                    match_exp = match[1];
                }
                else {
                    match_exp = match[0].substring(11).replace("=", "").trim();
                }
                //console.log(match_exp);
                if (reserved_keywords.indexOf(match_exp) < 0) {
                    var message = 'Not a Valid Linktype. \n Valid linktypes are : IP Address,Network,MAC Address,URL,Hash,Registry Key,User,Host Name,File,Geo Location';
                    diag.push({
                        code: '',
                        message: 'Not a Valid Linktype',
                        range: new vscode.Range(new vscode.Position(index, match.index), new vscode.Position(index, match.index + match_exp.length)),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: '',
                        relatedInformation: [
                            new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(index + 1, match.index), new vscode.Position(index + 1, match.index + match[0].length))), message)
                        ]
                    });
                    //console.log("Present");
                }
                match = reg_match_regex.exec(line);
            }
        }
    }
    else {
        collection.clear();
    }
    return (diag);
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map