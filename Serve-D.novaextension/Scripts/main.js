//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const ServeD = require("./served.js");
const Cfg = require("./config.js");
const Commands = require("./commands.js");
const Navigate = require("./navigate.js");
const Edits = require("./edits.js");
const Format = require("./format.js");

var lspServer = null;

exports.activate = function () {
  // Do work when the extension is activated
  lspServer = new ServeD();
  lspServer.start();

  nova.workspace.onDidAddTextEditor((editor) => {
    if (editor.document.syntax != "d") return;
    editor.onWillSave((editor) => {
      const formatOnSave = nova.workspace.config.get(Cfg.formatOnSave);
      if (formatOnSave) {
        return Format.formatFile(lspServer, editor);
      }
    });
  });
  nova.commands.register(Commands.formatFile, (editor) => {
    Format.formatFileCmd(lspServer, editor);
  });
  nova.commands.register(Commands.jumpToDefinition, (editor) =>
    Navigate.toDefinition(lspServer, editor)
  );
  nova.commands.register(Commands.preferences, (_) =>
    nova.workspace.openConfig()
  );
  nova.commands.register(Commands.extensionPreferences, (_) =>
    nova.openConfig()
  );
  nova.commands.register(Commands.restartServer, lspServer.restart, lspServer);
};

// async function formatFileCmd(editor) {
//   try {
//     await formatFile(editor);
//   } catch (err) {
//     Messages.showError(err.message);
//   }
// }

// async function formatFile(editor) {
//   var cmdArgs = {
//     textDocument: {
//       uri: editor.document.uri,
//     },
//     options: {
//       tabSize: editor.tabLength,
//       insertSpaces: editor.softTabs,
//     },
//     // TBD: options
//   };
//   const changes = await lspServer.sendRequest(
//     "textDocument/formatting",
//     cmdArgs
//   );
//
//   if (!changes) {
//     return;
//   }
//   await Edits.applyEdits(editor, changes);
// }

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  if (lspServer) {
    lspServer.deactivate();
    lspServer = null;
  }
};
