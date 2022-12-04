//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Edits = require("./edits.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Ranges = require("./ranges.js");
const Position = require("./position.js");
const State = require("./state.js");
const Lsp = require("./served.js");

async function renameSym(editor) {
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
  const prepResult = await Lsp.sendRequest("textDocument/prepareRename", {
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
        prompt: Messages.getMsg(Catalog.msgRename),
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

  const response = await Lsp.sendRequest("textDocument/rename", params);

  if (!response) {
    Messages.showWarning(Catalog.msgCouldNotRenameSym);
  }

  await Edits.applyWorkspaceEdits(response);

  // return to original location
  await nova.workspace.openFile(editor.document.uri);
  editor.scrollToCursorPosition();
}

async function renameSymbolCmd(editor) {
  try {
    renameSym(editor);
  } catch (err) {
    Messages.showError(err.message);
  }
}

function register() {
  State.registerCommand(Commands.renameSymbol, renameSymbolCmd);
}

module.exports = { register: register };
