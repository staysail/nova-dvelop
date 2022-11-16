//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

function extName(suffix) {
  return "tech.staysail.served." + suffix;
}

// These are configuration parameters. If public they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  lspFlavor: extName("lsp.flavor"),
  lspPath: extName("lsp.path"),
  formatOnSave: extName("fmt.OnSave"),
};

module.exports = keys;