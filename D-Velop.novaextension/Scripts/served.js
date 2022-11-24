//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Config = require("./config.js");
const State = require("./state.js");
const delay = require("./delay.js");

var lspClient = null;
var tasks = null;

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
    setTimeout(sendConfig, 200); // send config (50 ms for initialization)
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
  delay(1000); // wait a second before trying to restart
  let rv = await startClient();
  if (rv) {
    Messages.showNotice(Catalog.msgLspRestarted, "");
  }
  return rv;
}

async function sendRequest(method, params) {
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

  State.emitter.emit(State.events.onDub);
}

function getConfig(name) {
  return nova.workspace.config.get(name) ?? nova.config.get(name);
}

function sendConfig() {
  let cfg = defaultConfig();
  cfg.d.dubPath = getConfig(Config.dubPath) ?? cfg.d.dubPath;
  cfg.d.dmdPath = getConfig(Config.dmdPath) ?? cfg.d.dmdPath;
  cfg.d.projectImportPaths =
    getConfig(Config.projectImportPaths) ?? cfg.d.projectImportPaths;
  cfg.d.overrideDfmtEditorconfig =
    getConfig(Config.overrideEditorConfig) ?? cfg.d.overrideDfmtEditorconfig;
  cfg.dfmt.alignSwitchStatements =
    getConfig(Config.alignSwitch) ?? cfg.dfmt.alignSwitchStatements;
  cfg.dfmt.braceStyle = getConfig(Config.braceStyle) ?? cfg.dfmt.braceStyle;
  cfg.dfmt.keepLineBreaks =
    getConfig(Config.keepBreaks) ?? cfg.dfmt.keepLineBreaks;
  cfg.dfmt.splitOperatorAtLineEnd =
    getConfig(Config.breakAfterOp) ?? cfg.dfmt.splitOperatorAtLineEnd;
  cfg.dfmt.compactLabeledStatements =
    getConfig(Config.compactLabeled) ?? cfg.dfmt.compactLabeledStatements;
  cfg.dfmt.spaceAfterCast =
    getConfig(Config.spaceAfterCast) ?? cfg.dfmt.spaceAfterCast;
  cfg.dfmt.spaceBeforeFunctionParameters =
    getConfig(Config.spaceBeforeFuncParams) ??
    cfg.dfmt.spaceBeforeFunctionParameters;
  cfg.dfmt.selectiveImportSpace =
    getConfig(Config.selectiveImportSpace) ?? cfg.dfmt.selectiveImportSpace;
  cfg.dfmt.spaceBeforeAAColon =
    getConfig(Config.spaceBeforeAAColon) ?? cfg.dfmt.spaceBeforeAAColon;
  cfg.dfmt.singleIndent =
    getConfig(Config.singleIndent) ?? cfg.dfmt.singleIndent;
  switch (getConfig(Config.templateConstraintStyle)) {
    case "cond0":
      cfg.dfmt.templateConstraintStyle = "conditional_newline";
      cfg.dfmt.singleTemplateConstraintIndent = false;
      break;
    case "cond1":
      cfg.dfmt.templateConstraintStyle = "conditional_newline_indent";
      cfg.dfmt.singleTemplateConstraintIndent = true;
      break;
    case "cond2":
      cfg.dfmt.templateConstraintStyle = "conditional_newline_indent";
      cfg.dfmt.singleTemplateConstraintIndent = false;
      break;
    case "always0":
      cfg.dfmt.templateConstraintStyle = "always_newline";
      cfg.dfmt.singleTemplateConstraintIndent = false;
      break;
    case "always1":
      cfg.dfmt.templateConstraintStyle = "always_newline_indent";
      cfg.dfmt.singleTemplateConstraintIndent = true;
      break;
    case "always2":
      cfg.dfmt.templateConstraintStyle = "always_newline_indent";
      cfg.dfmt.singleTemplateConstraintIndent = false;
      break;
    default:
      // no change
      break;
  }
  cfg.editor.rules = [80, 120];
  cfg.editor.rulers[0] = getConfig(Config.softLineLength) ?? 80;
  cfg.editor.rulers[1] = getConfig(Config.hardLineLength) ?? 120;
  // tabSize? we don't have access necessarily to the editor's tabSize

  cfg.d.manyProjectsThreshold =
    getConfig(Config.tooManyProjectsThreshold) ?? cfg.d.manyProjectsThreshold;
  cfg.d.manyProjectsAction =
    getConfig(Config.tooManyProjectsAction) ?? cfg.d.manyProjectsAction;

  sendNotification("served/didChangeConfiguration", { settings: cfg });
}

function watchConfigVar(name) {
  State.disposal.add(
    nova.config.onDidChange(name, (nv, ov) => {
      // this doesn't send an update a workspace override exists
      if (nv != getConfig(name)) {
        sendConfig();
      }
    })
  );
  State.disposal.add(
    nova.workspace.config.onDidChange(name, (nv, ov) => {
      // this always sends an update
      if (nv != ov) {
        sendConfig();
      }
    })
  );
}

function watchConfig() {
  watchConfigVar(Config.dubPath);
  watchConfigVar(Config.dmdPath);
  watchConfigVar(Config.projectImportPaths);
  watchConfigVar(Config.overrideEditorConfig);
  watchConfigVar(Config.braceStyle);
  watchConfigVar(Config.alignSwitch);
  watchConfigVar(Config.compactLabeled);
  watchConfigVar(Config.keepBreaks);
  watchConfigVar(Config.hardLineLength);
  watchConfigVar(Config.softLineLength);
  watchConfigVar(Config.breakAfterOp);
  watchConfigVar(Config.spaceAfterCast);
  watchConfigVar(Config.spaceBeforeFuncParams);
  watchConfigVar(Config.selectiveImportSpace);
  watchConfigVar(Config.tooManyProjectsAction);
  watchConfigVar(Config.tooManyProjectsThreshold);
}

function register() {
  watchConfig();
  State.registerCommand(Commands.restartServer, restartClient);
  State.emitter.on(State.events.onUpdate, restartClient);
  State.emitter.on(State.events.onActivate, startClient);
}

let ServeD = {
  restart: restartClient,
  deactivate: stopClient,
  sendRequest: sendRequest,
  getTasks: () => {
    return tasks;
  },
  register: register,
};
module.exports = ServeD;
