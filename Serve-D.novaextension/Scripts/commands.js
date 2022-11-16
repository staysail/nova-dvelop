//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

function extName(suffix) {
  return "tech.staysail.served." + suffix;
}

// These are command identifiers. If exposed to users they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  preferences: extName("preferences"),
  extensionPreferences: extName("extensionPreferences"),
  restartServer: extName("restartServer"),
  jumpToDefinition: extName("jumpToDefinition"),
  formatFile: extName("formatFile"),
};

module.exports = keys;
