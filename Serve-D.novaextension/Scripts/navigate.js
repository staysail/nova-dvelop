//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

Messages = require("./messages.js");
Catalog = require("./catalog.js");
Position = require("./position.js");

// internal navigate function
async function jumpTo(lspServer, editor, thing) {
  console.log(`Jumping to ${thing}`);

  try {
    const selected = editor.selectedRange;
    if (!selected) {
      Messages.showError(Catalog.msgNothingSelected);
      return;
    }
    const position = Position.toLsp(editor.document, selected.start);
    const response = await lspServer.sendRequest(`textDocument/${thing}`, {
      textDocument: { uri: editor.document.uri },
      position: position,
    });
    await chooseLocation(response);
  } catch (err) {
    Messages.showError(err.message);
  }
}

// chooseLocation either jumps to a location if the
// argument is a single location, or offers a selection palette.
// It understands both Location and LocationLink.
async function chooseLocation(locs) {
  if (!Array.isArray(locs)) {
    if (loc) {
      return showLocation(loc);
    }
    Messages.showNotice(Catalog.msgNothingFound, "");
    return;
  }
  if (locs.length == 0) {
    Messages.showNotice(Catalog.msgNothingFound, "");
    return;
  }
  if (locs.length == 1) {
    return showLocation(locs[0]);
  }
  let choices = [];
  for (let i in locs) {
    let uri = "";
    let line = 1;
    if (locs[i].targetUri) {
      uri = locs[i].targetUri;
      line = locs[i].targetRange.start.line + 1;
    } else {
      uri = locs[i].uri;
      line = locs[i].range.start.line + 1;
    }
    let file = uri.replace(/^file:\/\//, "");
    file = nova.workspace.relativizePath(file);
    choices.push(`${file}:${line}`);
  }
  nova.workspace.showChoicePalette(
    choices,
    { placeholder: getMsg(Catalog.msgSelectLocation) },
    (choice, index) => {
      if (choice != null) {
        showLocation(locs[index]);
      }
    }
  );
}

class Navigate {
  static toDefinition(lspServer, editor) {
    jumpTo(editor, "definition");
  }

  static toTypeDefinition(lspServer, editor) {
    jumpTo(editor, "typeDefinition");
  }

  static toDeclaration(lspServer, editor) {
    jumpTo(editor, "declaration");
  }

  static toImplementation(lspServer, editor) {
    jumpTo(editor, "implementation");
  }
}

module.exports = Navigate;
