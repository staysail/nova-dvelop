const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const ServeD = require("./served.js");

var langserver = null;

exports.activate = function () {
  // Do work when the extension is activated
  langserver = new ServeD();

  nova.workspace.onDidAddTextEditor((editor) => {
    if (editor.document.syntax != "d") return;
    editor.onWillSave((editor) => {
      const formatOnSave = nova.workspace.config.get("d.dfmt.formatOnSave");
      if (formatOnSave) {
        return formatFile(editor);
      }
    });
  });
  nova.commands.register("dfmt.format", formatFileCmd);
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
  const lines = document
    .getTextInRange(new Range(0, document.length))
    .split(document.eol);
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
  return editor.edit((textEditorEdit) => {
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
      Messages.showError(Catalog.msgNoLspClient);
      console.error("no language client");
      return;
    }
    const changes = await client.sendRequest(
      "textDocument/formatting",
      cmdArgs
    );

    if (!changes) {
      return;
    }
    await lspApplyEdits(editor, changes);
  }
}

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  if (langserver) {
    langserver.deactivate();
    langserver = null;
  }
};
