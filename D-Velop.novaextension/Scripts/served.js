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

// serve-d wants us to send the complete config, so we fill in a generic
// default that covers it all.
function defaultConfig() {
  return {
    d: {
      stdlibPath: "auto", // can be an array
      dubPath: "dub",
      dmdPath: "dmd",
      enableLinting: true,
      enableSDLLinting: true,
      enableStaticLinting: true,
      enableDubLinting: true,
      enableAutoComplete: true,
      enableFormatting: true,
      enableDMDImportTiming: false,
      enableCoverageDecoration: false, // upstream true, Nova can't
      enableGCProfilerDecorations: false, // upstream true, Nova can't
      neverUseDub: false,
      projectImportPaths: [], // string array
      dubConfiguration: "",
      dubArchType: "",
      dubBuildType: "",
      dubCompiler: "",
      overrideDfmtEditorconfig: true, // we might want to revisit this!
      aggressiveUpdate: false, // differs from default code-d settings on purpose!
      argumentSnippets: false,
      scanAllFolders: true,
      disabledRootGlobs: [], // string array
      extraRoots: [], // string array
      manyProjectsAction: "ask", // see  = ManyProjectsAction.ask;
      manyProjectsThreshold: 6,
      lintOnFileOpen: "project",
      dietContextCompletion: false,
      generateModuleNames: true,
    },
    dfmt: {
      alignSwitchStatements: true,
      braceStyle: "allman",
      outdentAttributes: true,
      spaceAfterCast: true,
      splitOperatorAtLineEnd: false,
      selectiveImportSpace: true,
      compactLabeledStatements: true,
      templateConstraintStyle: "conditional_newline_indent",
      spaceBeforeFunctionParameters: false,
      singleTemplateConstraintIndent: false,
      spaceBeforeAAColon: false,
      keepLineBreaks: true,
      singleIndent: true,
    },
    dscanner: {
      ignoredKeys: [], // string array
    },
    editor: {
      rulers: [], // array of integers
      tabSize: 4, // for now
    },
    git: {
      git: "git", // path
    },
  };
}

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

  let debug = false;
  if (nova.inDevMode()) {
    debug = true;
  }
  // Create the client
  var serverOptions = {
    path: path,
    args: args,
  };
  var clientOptions = {
    // The set of document syntaxes for which the server is valid
    syntaxes: ["d"],
    debug: debug,
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
    setTimeout(sendConfig, 1000); // send config (50 ms for initialization)
    setTimeout(getInfo, 2500);
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

async function getInfo() {
  console.error("GETTING ARCHES");
  let arches = await lspClient.sendRequest("served/listArchTypes", {});
  console.error("ARCHES is", JSON.stringify(arches));
  let arch = await lspClient.sendRequest("served/getArchType", {});
  console.error("CURRENT ARCH is", arch);
  let builds = await lspClient.sendRequest("served/listBuildTypes", {});
  console.error("BUILD TYPES is", JSON.stringify(builds));
  let build = await lspClient.sendRequest("served/getBuildType", {});
  console.error("CURRENT BUILD TYPE is", build);
  let compiler = await lspClient.sendRequest("served/getCompiler", {});
  console.error("CURRENT COMPILER IS", compiler);
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

function sendNotification(method, params) {
  if (lspClient) {
    return lspClient.sendNotification(method, params);
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

function getConfig(name) {
  return nova.workspace.config.get(name) ?? nova.config.get(name);
}

function sendConfig() {
  let cfg = defaultConfig();
  cfg.d.dubPath = getConfig(Config.dubPath) ?? cfg.d.dubPath;

  sendNotification("served/didChangeConfiguration", { settings: cfg });
}

function watchConfig() {
  nova.config.observe(Config.dubPath, (nv, ov) => {
    sendConfig();
  });
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
