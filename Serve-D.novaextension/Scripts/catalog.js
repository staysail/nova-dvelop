//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const catalog = {
  msgNoLspClient: "msgNoLspClient",
  msgLspRestarted: "msgLspRestarted",
  msgLspStoppedErr: "msgLspStoppedErr",
  msgLspDidNotStart: "msgLspDidNotStart",
};

// default english strings
const values = {
  msgNoLspClient: "No LSP client",
  msgLspRestarted: "Language server restarted.",
  msgLspStoppedErr: "Language server stopped with an error.",
  msgLspDidNotStart: "Language server failed to start.",
};

catalog.values = values;

module.exports = catalog;
