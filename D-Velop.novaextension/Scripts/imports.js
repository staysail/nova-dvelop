//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.
const Edits = require("./edits.js");

class Imports {
  static async sortImportsCmd(lspServer, editor) {
    try {
      this.sortImports(lspServer, editor);
    } catch (err) {
      Messages.showError(err.message);
    }
  }

  static async sortImports(lspServer, editor) {
    var cmdArgs = {
      textDocument: {
        uri: editor.document.uri,
      },
      location: editor.selectedRange.start,
    };
    const changes = await lspServer.sendRequest("served/sortImports", cmdArgs);

    if (!changes) {
      return;
    }
    await Edits.applyEdits(editor, changes);
  }
}

module.exports = Imports;
