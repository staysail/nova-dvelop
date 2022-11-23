//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const ServeD = require("./served.js");
const Config = require("./config.js");
const Commands = require("./commands.js");
const Navigate = require("./navigate.js");
const Edits = require("./edits.js");
const Format = require("./format.js");
const GitHub = require("./github.js");
const Update = require("./update.js");
const Dub = require("./dub.js");
const Weka = require("./weka.js");
const Rename = require("./rename.js");
const Imports = require("./imports.js");

let lspServer = ServeD;

exports.activate = function () {
  // Do work when the extension is activated
  if (lspServer == null) {
    lspServer = new ServeD();
  }
  lspServer.start();

  Dub.setLspServer(lspServer);
  lspServer.onReloadDub(Dub.reloadTasks);
  lspServer.startUp();

  // If we should check for new versions at start up, try to download from
  // GitHub releases.
  if (nova.config.get(Config.checkForUpdates)) {
    // if it doesn't work, don't bother warning about it.
    try {
      Update.checkForUpdate();
    } catch (error) {}
  }

  nova.workspace.onDidAddTextEditor((editor) => {
    if (editor.document.syntax != "d") return;
    editor.onWillSave((editor) => {
      const formatOnSave = nova.workspace.config.get(Config.formatOnSave);
      if (formatOnSave) {
        return Format.formatFile(lspServer, editor);
      }
    });
  });

  Update.onUpdate(restart);
  nova.commands.register(Commands.formatFile, (editor) => {
    Format.formatFileCmd(lspServer, editor);
  });
  nova.commands.register(Commands.sortImports, (editor) => {
    Imports.sortImportsCmd(lspServer, editor);
  });
  nova.commands.register(Commands.jumpToDefinition, (editor) => {
    Navigate.toDefinition(lspServer, editor);
  });

  nova.commands.register(Commands.renameSymbol, (editor) => {
    Rename.renameSymbol(lspServer, editor);
  });

  nova.commands.register(Commands.preferences, (_) =>
    nova.workspace.openConfig()
  );
  nova.commands.register(Commands.extensionPreferences, (_) =>
    nova.openConfig()
  );
  nova.commands.register(Commands.restartServer, restart);

  nova.commands.register(Commands.checkForUpdate, async function (_) {
    try {
      Update.checkForUpdate(true);
    } catch (error) {
      Messages.showError(error.message);
    }
  });

  Dub.register();
  nova.assistants.registerTaskAssistant(Weka, {
    identifier: "weka",
    name: "Weka",
  });
};

function restart() {
  lspServer.restart();
}

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  if (lspServer) {
    lspServer.deactivate();
    lspServer = null;
  }
};
