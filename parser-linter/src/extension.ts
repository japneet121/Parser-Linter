'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {

	const collection = vscode.languages.createDiagnosticCollection('test');
	if (vscode.window.activeTextEditor) {
		updateDiagnostics(vscode.window.activeTextEditor.document, collection);
	}
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => {
		if (editor) {
			updateDiagnostics(editor.document, collection);
		}
	}));
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		updateDiagnostics(document, collection);
	});
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
	if (document) {
		let lines = document.getText().split('\n');
		let diag=[];
		for (let index = 0; index < lines.length; index++) {
			let reg_match_regex = new RegExp(/r\|.+?( |\n|$)/, 'ig');
			//let matches=document.getText().match(reg_match_regex);
			let line=lines[index];
			var match = reg_match_regex.exec(line);
			// matches.forEach(element => {
			// 	console.log();
			// });
			while (match) {
				console.log(match);
				
				try {
					let r=new RegExp(match[0].substring(2));
				}
				catch (exception) {
					var message = exception.message;
					diag.push({
						code: '',
						message: 'Not a Valid Regex',
						range: new vscode.Range(new vscode.Position(index, match.index), new vscode.Position(index, match.index+match[0].length)),
						severity: vscode.DiagnosticSeverity.Error,
						source: '',
						relatedInformation: [
							new vscode.DiagnosticRelatedInformation(new vscode.Location(document.uri, new vscode.Range(new vscode.Position(index+1, match.index), new vscode.Position(index+1, match.index+match[0].length))), message)
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
	} else {
		collection.clear();
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
}