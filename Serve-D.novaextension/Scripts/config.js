//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are configuration parameters. If public they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  lspFlavor: "dvelop.lsp.flavor",
  lspPath: "dvelop.lsp.path",
  formatOnSave: "dvelop.fmt.OnSave",
  useCustomServer: "dvelop.useCustomServer",
  customServerPath: "dvelop.customServerPath",
  allowPreRelease: "dvelop.allowPreRelease",
  checkForUpdates: "dvelop.checkForUpdates",

  // context keys that don't get written out
  currentServeD: "dvelop.served.current",
  releaseServeD: "dvelop.served.release",
};

module.exports = keys;
