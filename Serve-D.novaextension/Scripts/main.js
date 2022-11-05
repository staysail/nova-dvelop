var langserver = null;

exports.activate = function() {
	// Do work when the extension is activated
	langserver = new DLanguageServer();

	nova.workspace.onDidAddTextEditor(editor => {
		if (editor.document.syntax != 'd') return;
		editor.onWillSave(editor => {
			const formatOnSave = nova.workspace.config.get('d.dfmt.formatOnSave');
			if (formatOnSave) {
				return formatFile(editor);
			}
		});
	});
	nova.commands.register('dfmt.format', formatFileCmd);
};

async function formatFileCmd(editor) {
	try {
		await formatFile(editor);
	} catch (err) {
		nova.workspace.showErrorMessage(err);
	}
}

// Nova ranges are absolute character offsets
// LSP ranges based on line/column.
function lspRangeToNovaRange(document, range) {
	let pos = 0;
	let start = 0;
	let end = document.length;
	const lines = document.getTextInRange(new Range(0, document.length)).split(document.eol);
	for (let line = 0; line < lines.length; line++) {
		if (range.start.line == line) {
			start = pos + range.start.character;
		}
		if (range.end.line == line) {
			end = pos + range.end.character;
			break; // we finished, so no need to keep scanning the doc
		}
		pos += lines[line].length + document.eol.length;
	}
	let res = new Range(start, end);
	return res;
}

function lspApplyEdits(editor, edits) {
	return editor.edit(textEditorEdit => {
		for (const change of edits.reverse()) {
			const range = lspRangeToNovaRange(editor.document, change.range);
			textEditorEdit.replace(range, change.newText);
		}
	});
}

async function formatFile(editor) {
	if (langserver && langserver.languageClient) {
		var cmdArgs = {
			textDocument: {
				uri: editor.document.uri,
			},
			options: {
				tabSize: editor.tabLength,
				insertSpaces: editor.softTabs,
			},
			// TBD: options
		};
		var client = langserver.languageClient;
		if (!client) {
			console.error('no language client');
			return;
		}
		const changes = await client.sendRequest('textDocument/formatting', cmdArgs);

		if (!changes) {
			return;
		}
		await lspApplyEdits(editor, changes);
	}
}

exports.deactivate = function() {
	// Clean up state before the extension is deactivated
	if (langserver) {
		langserver.deactivate();
		langserver = null;
	}
};

class DLanguageServer {
	constructor() {
		// Observe the configuration setting for the server's location, and restart the server on change
		nova.config.observe(
			'd.language-server-path',
			function(path) {
				this.start(path);
			},
			this
		);
	}

	deactivate() {
		this.stop();
	}

	start(path) {
		if (this.languageClient) {
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
		}

		// Use the default server path
		if (!path) {
			path = '/usr/local/bin/serve-d';
		}

		// Create the client
		var serverOptions = {
			path: path,
			// uncomment the following for debugging
			// args: ['--loglevel', 'trace'],
		};
		var clientOptions = {
			// The set of document syntaxes for which the server is valid
			syntaxes: ['d'],
			debug: true,
		};
		var client = new LanguageClient('d-langserver', 'D Language Server', serverOptions, clientOptions);

		try {
			// Start the client
			client.start();

			// Add the client to the subscriptions to be cleaned up
			nova.subscriptions.add(client);
			this.languageClient = client;
		} catch (err) {
			// If the .start() method throws, it's likely because the path to the language server is invalid

			if (nova.inDevMode()) {
				console.error(err);
			}
		}
	}

	stop() {
		if (this.languageClient) {
			this.languageClient.stop();
			nova.subscriptions.remove(this.languageClient);
			this.languageClient = null;
		}
	}
}
