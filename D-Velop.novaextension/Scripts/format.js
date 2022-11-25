//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./Messages.js");
const Config = require("./config.js");
const Edits = require("./edits.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const Lsp = require("./served.js");

async function formatFileCmd(editor) {
  try {
    formatFile(editor);
  } catch (err) {
    Messages.showError(err.message);
  }
}

async function formatFile(editor) {
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
  const changes = await Lsp.sendRequest("textDocument/formatting", cmdArgs);

  if (!changes) {
    return;
  }
  await Edits.applyEdits(editor, changes);
}

function formatOnSave(editor) {
  if (editor.document.syntax != "d") {
    return;
  }
  if (Prefs.getConfig(Config.disableServer)) {
    return;
  }
  const formatOnSave = Prefs.getConfig(Config.formatOnSave);
  if (formatOnSave) {
    return formatFile(editor);
  }
}

function register() {
  State.registerCommand(Commands.formatFile, formatFileCmd);

  State.disposal.add(
    nova.workspace.onDidAddTextEditor((editor) => {
      if (editor.document.syntax == "d") {
        State.disposal.add(editor.onWillSave((editor) => formatOnSave(editor)));
      }
    })
  );
}

module.exports = { register: register };
