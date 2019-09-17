'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    const collection = vscode.languages.createDiagnosticCollection('test');
    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, collection);
    }
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            updateDiagnostics(editor.document, collection);
        }
    }));
    vscode.workspace.onDidSaveTextDocument((document) => {
        updateDiagnostics(document, collection);
    });
}
exports.activate = activate;
function updateDiagnostics(document, collection) {
    if (document) {
        let lines = document.getText().split('\n');
        let diag = [];
        let reg_match_regex = new RegExp(/(r\|.+?(\n|$))|REGEX= *(.+?($|\n))/, 'ig');
        for (let index = 0; index < lines.length; index++) {
            let line = lines[index];
            var match = reg_match_regex.exec(line);
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
            collection.set(document.uri, diag);
            for (let index = 0; index < lines.length; index++) {
                const element = lines[index];
            }
        }
    }
    else {
        collection.clear();
    }
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map