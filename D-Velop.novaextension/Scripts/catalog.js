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
  msgUpToDate: "msgUpToDate",
  msgDownloadFailed: "msgDownloadFailed",
};

// default English strings
const values = {
  msgNoLspClient: "No LSP client.",
  msgLspRestarted: "Language server restarted.",
  msgLspStoppedErr: "Language server stopped with an error.",
  msgLspDidNotStart: "Language server failed to start.",
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
  msgUpToDate: "Language server is up to date.",
  msgDownloadFailed: "Download of asset failed.",
};

// verify that every entry in the catalog has a matching entry in values
for (name in catalog) {
  if (!values[name]) {
    throw `Key mismatch for ${name}`;
  }
}

catalog.values = values;

module.exports = catalog;
