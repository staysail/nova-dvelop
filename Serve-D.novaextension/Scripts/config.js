//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

function extName(suffix) {
  return "staysail.tech.served." + suffix;
}

const keys = {
  lspFlavor: extName("lsp.flavor"),
  lspPath: extName("lsp.path"),
  formatOnSave: extName("fmt.OnSave"),
};

module.exports = keys;
