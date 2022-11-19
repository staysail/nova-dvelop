//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Config = require("./config.js");

class ServeD extends Disposable {
  constructor() {
    super();
    this.lspClient = null;
    nova.subscriptions.add(this);
  }

  deactivate() {
    this.dispose();
  }

  didStop(error) {
    if (error) {
      Messages.showError(Catalog.msgLspStoppedErr);
      console.error("Language server stopped with error:", error.message);
    } else {
      if (this.wantRestart) {
        this.wantRestart = false;
        this.start();
        Messages.showNotice(Catalog.msgLspRestarted, "");
      }
    }
  }

  start() {
    if (this.lspClient) {
      // stop client
      this.lspClient.stop();
      this.lspClient = null;
    }

    let path = "";
    let args = [];
    // uncomment the following for debugging
    //    args.concat(["--loglevel", "trace"]);

    if (nova.config.get(Config.useCustomServer)) {
      path = nova.config.get(Config.customServerPath);
      // Use the default server path
      if (!path) {
        path = "/usr/local/bin/serve-d";
      }
    } else {
      path = nova.path.join(nova.extension.globalStoragePath, "serve-d");
    }

    if (!nova.fs.access(path, nova.fs.X_OK)) {
      return;
    }

    // Create the client
    var serverOptions = {
      path: path,
      args: args,
    };
    var clientOptions = {
      // The set of document syntaxes for which the server is valid
      syntaxes: ["d"],
      debug: true,
    };
    this.lspClient = new LanguageClient(
      "d-langserver",
      "Serve-D",
      serverOptions,
      clientOptions
    );

    this.lspClient.onDidStop(this.didStop, this);

    try {
      // Start the client
      this.lspClient.start();
    } catch (err) {
      Messages.showNotice(Catalog.msgLspDidNotStart, "");
      console.error(err);
      this.lspClient = null;
    }
  }

  async sendRequest(method, params) {
    if (this.lspClient == null) {
      Messages.showError(Catalog.msgNoLspClient);
    } else {
      return this.lspClient.sendRequest(method, params);
    }
  }

  restart() {
    if (this.lspClient) {
      this.wantRestart = true;
      this.lspClient.stop();
      this.lspClient = null;
    } else {
      this.start();
    }
  }

  async dispose() {
    if (this.lspClient) {
      this.lspClient.stop();
      this.lspClient = null;
    }
  }
}

module.exports = ServeD;
