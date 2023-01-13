//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const ServeD = require("./served.js");
const Navigate = require("./navigate.js");
const Format = require("./format.js");
const Update = require("./update.js");
const Dub = require("./dub.js");
const Weka = require("./weka.js");
const Rename = require("./rename.js");
const Imports = require("./imports.js");
const Prefs = require("./prefs.js");
const Symbols = require("./symbols.js");
const Info = require("./info.js");
const State = require("./state.js");
const References = require("./references.js");

exports.activate = function () {
  Prefs.register();
  Weka.register();
  Format.register();
  Imports.register();
  Navigate.register();
  Rename.register();
  Dub.register();
  Update.register();
  Info.register();
  Symbols.register();
  References.register();
  ServeD.register();

  // kick off signal to get everything running
  State.emitter.emit(State.events.onActivate);
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  ServeD.deactivate();
  State.disposal.dispose();
};
