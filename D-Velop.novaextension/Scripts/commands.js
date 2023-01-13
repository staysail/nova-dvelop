//
// Copyright 2023 Staysail Systems, Inc.
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
  findCompiler: "dvelop.findCompiler",
  sortImports: "dvelop.sortImports",
  findSymbols: "dvelop.findSymbols",
  showSymbols: "dvelop.showSymbols",
  getArchTypes: "dvelop.getArchTypes",
  getBuildTypes: "dvelop.getBuildTypes",
  getDubConfigs: "dvelop.getDubConfigs",
  findReferences: "dvelop.findReferences",
  showReferences: "dvelop.showReferences",
};

module.exports = keys;
