//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are string keys for localization.
// It is important that the string values match the
// key values, and that the key values match the keys
// of the values object as well.

const catalog = {
  msgNoLspClient: "msgNoLspClient",
  msgLspRestarted: "msgLspRestarted",
  msgLspStoppedErr: "msgLspStoppedErr",
  msgLspDidNotStart: "msgLspDidNotStart",
  msgNothingSelected: "msgNothingSelected",
  msgNothingFound: "msgNothingFound",
  msgSelectLocation: "msgSelectLocation",
  msgUnableToApply: "msgUnableToApply",
  msgUnableToOpen: "msgUnableToOpen",
  msgNewServedTitle: "msgNewServedTitle",
  msgNewServedBody: "msgNewServedBody",
  msgMissingServedTitle: "msgMissingServedTitle",
  msgMissingServedBody: "msgMissingServedBody",
  msgInstall: "msgInstall",
  msgUpdate: "msgUpdate",
  msgCancel: "msgCancel",
  msgSearch: "msgSearch",
  msgRename: "msgRename",
  msgUpToDate: "msgUpToDate",
  msgDownloadFailed: "msgDownloadFailed",
  msgRenameSymbol: "msgRenameSymbol",
  msgNewName: "msgNewName", // for renaming symbols
  msgUnableToResolveSelection: "msgUnableToResolveSelection",

  msgSelectionNotRenameable: "msgSelectionNotRenameable",
  msgCouldNotRenameSym: "msgCouldNotRenameSymbol",
  msgLspDisabledTitle: "msgLspDisabledTitle",
  msgLspDisabledBody: "msgLspDisabledBody",
  msgLspIsCustomTitle: "msgLspIsCustomTitle",
  msgLspIsCustomBody: "msgLspIsCustomBody",
  msgSymbolsFoundTitle: "msgSymbolsFoundTitle",
  msgSymbolsFoundBody: "msgSymbolsFoundBody",
  msgSymbolsSearch: "msgSymbolsSearch",
  msgSymbol: "msgSymbol",
};

// default English strings
const values = {
  msgNoLspClient: "No LSP client.",
  msgLspRestarted: "Language server restarted.",
  msgLspStoppedErr: "Language server stopped with an error.",
  msgLspDidNotStart: "Language server failed to start.",
  msgNothingSelected: "Nothing is selected",
  msgNothingFound: "No matches found.",
  msgSelectLocation: "Select location",
  msgUnableToApply: "Unable to apply changes.",
  msgUnableToOpen: "Unable to open _URI_",
  msgNewServedTitle: "Update Available",
  msgNewServedBody:
    "An new language server (serve-d _VERSION_) update is available.",
  msgMissingServedTitle: "Server Missing",
  msgMissingServedBody:
    "A language server is required for full functionality. Install serve-d _VERSION_ now?",
  msgInstall: "Install",
  msgUpdate: "Update",
  msgCancel: "Cancel",
  msgSearch: "Search",
  msgRename: "Rename",
  msgUpToDate: "Language server is up to date.",
  msgDownloadFailed: "Download of asset failed.",
  msgRenameSymbol: "Rename symbol _OLD_SYMBOL_",
  msgNewName: "New name",
  msgUnableToResolveSelection: "Unable to resolve selection",
  msgSelectionNotRenameable: "No renameable symbol at cursor",
  msgCouldNotRenameSym: "Could not rename symbol",
  msgLspDisabledTitle: "Language server is disabled.",
  msgLspDisabledBody:
    "Some functionality will be reduced without a language server.",
  msgLspIsCustomTitle: "Language server is custom.",
  msgLspIsCustomBody: "Cannot check for updates when using a custom server.",
  msgSymbolsFoundTitle: "Found _COUNT_ Matches in _FILES_ Files",
  msgSymbolsFoundBody:
    "Check the Symbols pane in the D-Velop sidebar to see the results.",
  msgSymbolsSearch: "Search for symbol(s)",
  msgSymbol: "Symbol",
};

// verify that every entry in the catalog has a matching entry in values
for (name in catalog) {
  if (!values[name]) {
    throw `Key mismatch for ${name}`;
  }
}

catalog.values = values;

module.exports = catalog;
