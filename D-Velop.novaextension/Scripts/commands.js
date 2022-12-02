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
  jumpToTypeDefinition: "dvelop.jumpToTypeDefinition",
  jumpToDeclaration: "dvelop.jumpToDeclaration",
  jumpToImplementation: "dvelop.jumpToImplementation",
  formatFile: "dvelop.formatFile",
  formatSelection: "dvelop.formatSelection",
  checkForUpdate: "dvelop.checkForUpdate",
  renameSymbol: "dvelop.renameSymbol",
  findDub: "dvelop.findDub",
  findDmd: "dvelop.findDmd",
  sortImports: "dvelop.sortImports",
};

module.exports = keys;
