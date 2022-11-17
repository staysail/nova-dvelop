//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.
const Edits = require("./edits.js");

class Format {
  static async formatFileCmd(lspServer, editor) {
    try {
      this.formatFile(lspServer, editor);
    } catch (err) {
      Messages.showError(err.message);
    }
  }

  static async formatFile(lspServer, editor) {
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
    const changes = await lspServer.sendRequest(
      "textDocument/formatting",
      cmdArgs
    );

    if (!changes) {
      return;
    }
    await Edits.applyEdits(editor, changes);
  }
}

module.exports = Format;
