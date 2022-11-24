//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const State = require("./state.js");

function getConfig(name) {
  return nova.workspace.config.get(name) ?? nova.config.get(name);
}

function register() {
  State.registerCommand(Commands.preferences, (_) =>
    nova.workspace.openConfig()
  );
  State.registerCommand(Commands.extensionPreferences, (_) =>
    nova.openConfig()
  );
}

module.exports = {
  register: register,
  getConfig: getConfig,
};
