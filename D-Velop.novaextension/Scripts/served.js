//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Config = require("./config.js");
const delay = require("./delay.js");

var lspClient = null;
var tasks = null;
var onDub = null;

function stopClient() {
  if (lspClient) {
    lspClient.stop();
  }
}

async function startClient() {
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
    Messages.showNotice(catalog.msgNoLspClient, "");
    return null;
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
  lspClient = new LanguageClient(
    "d-langserver" + Date.now(), // use a unique server id for each call
    "Serve-D",
    serverOptions,
    clientOptions
  );

  // lspClient.onDidStop(this.didStop, this);

  lspClient.onNotification("coded/initDubTree", onDubInit);
  lspClient.onNotification("coded/updateDubTree", () => onDubInit);

  try {
    lspClient.start();
  } catch (err) {
    Messages.showNotice(Catalog.msgLspDidNotStart, err.message);
    return false;
  }

  var limit = 1000;
  while (!lspClient.running && limit > 0) {
    delay(10);
    limit -= 10;
  }
  if (lspClient.running) {
    return true;
  }

  Messages.showNotice(Catalog.msgLspDidNotStart, "");
  return false;
}

async function restartClient() {
  stopClient();
  let rv = await startClient();
  if (rv) {
    Messages.showNotice(Catalog.msgLspRestarted, "");
  }
  return rv;
}

async function sendRequest_(method, params) {
  if (lspClient == null) {
    Messages.showError(Catalog.msgNoLspClient);
    return null;
  } else {
    return lspClient.sendRequest(method, params);
  }
}

async function onDubInit() {
  if (lspClient == null) {
    return;
  }
  let result = await lspClient.sendRequest("served/buildTasks", {});

  // we are going to reorganize Tasks somewhat, so that they match the
  // organization of our provideTasks.  Note that DUB has richer support
  // than just Build, Run, Clean... so we are not really using that.

  tasks = {};
  if (!result || !Array.isArray(result)) {
    return;
  }

  for (var task of result) {
    if (task.source != "dub" || !task.definition) {
      continue;
    }
    "".replace();
    var def = task.definition;

    var cwd = task.definition.cwd;
    cwd = cwd.replace("${workspaceFolder}", nova.workspace.path + "/");
    var group = task.group;

    var arr = [];
    if (tasks[group]) {
      arr = tasks[group];
    }

    arr.push({
      name: task.name,
      exec: task.exec[0],
      args: task.exec.slice(1),
      group: group,
      cwd: cwd,
      run: !!def.run,
      test: !!def.test,
    });
    tasks[group] = arr;
  }

  if (onDub) {
    onDub();
  }
}

let ServeD = {
  restart: restartClient,
  start: startClient,
  stop: stopClient,
  deactivate: stopClient,
  sendRequest: sendRequest_,
  onReloadDub: (cb) => {
    onDub = cb;
  },
  getTasks: () => {
    return tasks;
  },
};
module.exports = ServeD;
