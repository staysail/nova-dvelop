//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are command identifiers. If exposed to users they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  preferences: "dvelop.preferences",
  extensionPreferences: "dvelop.extensionPreferences",
  restartServer: "dvelop.restartServer",
  jumpToDefinition: "dvelop.jumpToDefinition",
  formatFile: "dvelop.formatFile",
  checkForUpdate: "dvelop.checkForUpdate",
  renameSymbol: "dvelop.renameSymbol",
};

module.exports = keys;
