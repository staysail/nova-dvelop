//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.
const Edits = require("./edits.js");
const Lsp = require("./served.js");
const State = require("./state.js");
const Commands = require("./commands.js");

async function sortImportsCmd(editor) {
  try {
    sortImports(editor);
  } catch (err) {
    Messages.showError(err.message);
  }
}

async function sortImports(editor) {
  var cmdArgs = {
    textDocument: {
      uri: editor.document.uri,
    },
    location: editor.selectedRange.start,
  };
  const changes = await Lsp.sendRequest("served/sortImports", cmdArgs);

  if (!changes) {
    return;
  }
  await Edits.applyEdits(editor, changes);
}

function register() {
  let d = nova.commands.register(Commands.sortImports, (editor) =>
    sortImportsCmd(editor)
  );
  State.disposal.add(d);
}

module.exports = {
  register: register,
};
