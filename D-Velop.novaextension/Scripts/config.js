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
  formatOnSave: "dvelop.fmt.onSave",
  useCustomServer: "dvelop.useCustomServer",
  customServerPath: "dvelop.customServerPath",
  allowPreRelease: "dvelop.allowPreRelease",
  checkForUpdates: "dvelop.checkForUpdates",
  dubPath: "dvelop.dub.path",
  overrideEditorConfig: "dvelop.fmt.overrideEditorConfig",
  braceStyle: "dvelop.fmt.braceStyle",
  keepBreaks: "dvelop.fmt.keepBreaks",
  softLineLength: "dvelop.fmt.softLength",
  hardLineLength: "dvelop.fmt.hardLength",
  compactLabeled: "dvelop.fmt.compactLabeled",
  breakAfterOp: "dvelop.fmt.breakAfterOperator",
  spaceAfterCast: "dvelop.fmt.spaceAfterCast",
  spaceAfterKeyword: "dvelop.fmt.spaceAfterKeyword",
  spaceBeforeFuncParams: "dvelop.fmt.spaceBeforeParameters",
  selectiveImportSpace: "dvelop.fmt.selectiveImportSpace",
  spaceBeforeAAColon: "dvelop.fmt.spaceBeforeAAColon",
  singleIndent: "dvelop.fmt.singleIndent",
  templateConstraintStyle: "dvelop.fmt.templateConstraints",

  // context keys that don't get written out
  arch: "dvelop.served.arch", // to avoid waiting for calls to uname
  currentServeD: "dvelop.served.current",
  releaseServeD: "dvelop.served.release",
};

module.exports = keys;
