//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Edits = require("./edits.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Ranges = require("./ranges.js");
const Position = require("./position.js");

async function renameSym(lspServer, editor) {
  const selected = editor.selectedRange;
  if (!selected) {
    Messages.showError(Catalog.msgNothingSelected);
    return;
  }
  selectedPos = Position.toLsp(editor.document, selected.start);
  if (!selectedPos) {
    Messages.showError(Catalog.msgUnableToResolveSelection);
    return;
  }
  let oldName = editor.selectedText;
  const prepResult = await lspServer.sendRequest("textDocument/prepareRename", {
    textDocument: { uri: editor.document.uri },
    position: selectedPos,
  });
  if (prepResult == null) {
    Messages.showError(Catalog.msgSelectionNotRenameable);
    return;
  }
  if (prepResult.placeholder) {
    oldName = prepResult.placeholder;
  } else if (prepResult.range) {
    oldName = editor.document.getTextInRange(
      Ranges.fromLsp(editor.document, prepResult.range)
    );
  } else if (prepResult.start) {
    oldName = editor.document.getTextInRange(
      Ranges.fromLsp(editor.document, prepResult)
    );
  } else {
    Messages.showError(Catalog.msgSelectionNotRenameable);
    return;
  }

  const newName = await new Promise((resolve) => {
    nova.workspace.showInputPanel(
      Messages.getMsg(Catalog.msgRenameSymbol).replace("_OLD_SYMBOL_", oldName),
      {
        placeholder: oldName,
        value: oldName,
        label: Messages.getMsg(Catalog.msgNewName),
      },
      resolve
    );
  });

  if (!newName || newName == oldName) {
    return;
  }

  const params = {
    newName: newName,
    position: {
      line: Number(selectedPos.line),
      character: Number(selectedPos.character),
    },
    textDocument: { uri: editor.document.uri },
  };

  const response = await lspServer.sendRequest("textDocument/rename", params);

  if (!response) {
    Messages.showWarning(Catalog.msgCouldNotRenameSym);
  }

  await Edits.applyWorkspaceEdits(response);

  // return to original location
  await nova.workspace.openFile(editor.document.uri);
  editor.scrollToCursorPosition();
}

class Rename {
  static async renameSymbol(lspServer, editor) {
    try {
      renameSym(lspServer, editor);
    } catch (err) {
      Messages.showError(err.message);
    }
  }
}

module.exports = Rename;
