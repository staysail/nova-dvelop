//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Config = require("./config.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const Paths = require("./paths.js");
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
    lspClient = null;
  }
}

async function startClient() {
  let path = "";
  let args = ["--provide", "context-snippets", "--provide", "default-snippets"];
  // uncomment the following for debugging
  //    args.concat(["--loglevel", "trace"]);

  if (Prefs.getConfig(Config.disableServer)) {
    Messages.showNotice(
      Catalog.msgLspDisabledTitle,
      Catalog.msgLspDisabledBody
    );
    State.emitter.emit(State.events.onLsp, {
      state: Catalog.msgLspStateDisabled,
    });
    return null;
  }
  if (Prefs.getConfig(Config.useCustomServer)) {
    path = Prefs.getConfig(Config.customServerPath);
    if (!path) {
      let paths = Paths.findProgram(
        ["/usr/local/bin", "/opt/homebrew/bin"],
        ["serve-d"]
      );
      if (paths.length > 0) {
        path = paths[0];
      }
    }
  } else {
    path = nova.path.join(nova.extension.globalStoragePath, "serve-d");
  }

  if (!nova.fs.access(path, nova.fs.X_OK)) {
    Messages.showNotice(Catalog.msgNoLspClient, "");
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
    initializationOptions: {
      nonStandardConfiguration: true,
      startupConfiguration: getConfig(),
    },
  };
  if (nova.inDevMode() && Prefs.getConfig(Config.debugLsp)) {
    clientOptions.debug = true;
  }
  lspClient = new LanguageClient(
    "d-langserver" + Date.now(), // use a unique server id for each call
    "Serve-D",
    serverOptions,
    clientOptions
  );

  lspClient.onDidStop((error) => {
    console.warn("Language server stopped.");
    if (error) {
      console.error(
        "Language encountered error:",
        error.message || error || "unknown exit"
      );
      State.emitter.emit(State.events.onLsp, {
        state: Catalog.msgLspStateFailed,
        error: error.message || error,
      });
    } else {
      State.emitter.emit(State.events.onLsp, {
        state: Catalog.msgLspStateInactive,
      });
    }
  });

  lspClient.onNotification("coded/initDubTree", onDubInit);
  lspClient.onNotification("coded/updateDubTree", () => onDubInit);

  try {
    lspClient.start();
    setTimeout(onDubInit, 1000); // send config, but only after we start up
  } catch (err) {
    Messages.showNotice(Catalog.msgLspDidNotStart, err.message || err || "");
    State.emitter.emit(State.events.onLsp, {
      state: Catalog.msgLspStateFailed,
      error: err.message || err || "",
    });
    return false;
  }

  var limit = 1000;
  while (!lspClient.running && limit > 0) {
    await delay(10);
    limit -= 10;
  }

  if (lspClient.running) {
    // wait for a bit before we issue the getInfo call, because
    // the LSP start (initialize command) is not necessarily done yet.
    await delay(1000);
    try {
      let status = await lspClient.sendRequest("served/getInfo", {});
      State.emitter.emit(State.events.onLsp, {
        state: Catalog.msgLspStateRunning,
        version: status?.serverInfo?.version,
        name: status?.serverInfo?.name,
      });
    } catch (err) {
      State.emitter.emit(State.events.onLsp, {
        state: Catalog.msgLspStateRunning,
        error: err.message || err,
      });
    }
    return true;
  }

  Messages.showNotice(Catalog.msgLspDidNotStart, "");
  State.emitter.emit(State.events.onLsp, {
    state: Catalog.msgLspStateFailed,
    reason: Messages.getMsg(Catalog.msgLspDidNotStart),
  });

  return false;
}

async function restartClient() {
  console.warn("Stopping language server for restart.");
  stopClient();
  if (Prefs.getConfig(Config.disableServer)) {
    // emit this so that if we disable the server we regenerate new DUB
    // recipes.
    tasks = null;
    State.emitter.emit(State.events.onDub);
    return;
  }
  delay(2000); // wait a while before trying to restart
  console.warn("Start language server in restart.");
  let rv = await startClient();
  if (rv) {
    console.warn("Language server resetart complete");
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

function sendConfig() {
  let cfg = getConfig();
  sendNotification("served/didChangeConfiguration", { settings: cfg });
}

function getConfig() {
  let cfg = defaultConfig();
  cfg.d.dubPath = Prefs.getConfig(Config.dubPath) ?? cfg.d.dubPath;
  cfg.d.dmdPath = Prefs.getConfig(Config.dmdPath) ?? cfg.d.dmdPath;
  cfg.d.projectImportPaths =
    Prefs.getConfig(Config.projectImportPaths) ?? cfg.d.projectImportPaths;
  cfg.d.overrideDfmtEditorconfig =
    Prefs.getConfig(Config.overrideEditorConfig) ??
    cfg.d.overrideDfmtEditorconfig;
  cfg.dfmt.alignSwitchStatements =
    Prefs.getConfig(Config.alignSwitch) ?? cfg.dfmt.alignSwitchStatements;
  cfg.dfmt.braceStyle =
    Prefs.getConfig(Config.braceStyle) ?? cfg.dfmt.braceStyle;
  cfg.dfmt.keepLineBreaks =
    Prefs.getConfig(Config.keepBreaks) ?? cfg.dfmt.keepLineBreaks;
  cfg.dfmt.splitOperatorAtLineEnd =
    Prefs.getConfig(Config.breakAfterOp) ?? cfg.dfmt.splitOperatorAtLineEnd;
  cfg.dfmt.compactLabeledStatements =
    Prefs.getConfig(Config.compactLabeled) ?? cfg.dfmt.compactLabeledStatements;
  cfg.dfmt.spaceAfterCast =
    Prefs.getConfig(Config.spaceAfterCast) ?? cfg.dfmt.spaceAfterCast;
  cfg.dfmt.spaceBeforeFunctionParameters =
    Prefs.getConfig(Config.spaceBeforeFuncParams) ??
    cfg.dfmt.spaceBeforeFunctionParameters;
  cfg.dfmt.selectiveImportSpace =
    Prefs.getConfig(Config.selectiveImportSpace) ??
    cfg.dfmt.selectiveImportSpace;
  cfg.dfmt.spaceBeforeAAColon =
    Prefs.getConfig(Config.spaceBeforeAAColon) ?? cfg.dfmt.spaceBeforeAAColon;
  cfg.dfmt.singleIndent =
    Prefs.getConfig(Config.singleIndent) ?? cfg.dfmt.singleIndent;
  switch (Prefs.getConfig(Config.templateConstraintStyle)) {
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
  cfg.editor.rulers[0] = Prefs.getConfig(Config.softLineLength) ?? 80;
  cfg.editor.rulers[1] = Prefs.getConfig(Config.hardLineLength) ?? 120;
  // tabSize? we don't have access necessarily to the editor's tabSize

  cfg.d.manyProjectsThreshold =
    Prefs.getConfig(Config.tooManyProjectsThreshold) ??
    cfg.d.manyProjectsThreshold;
  cfg.d.manyProjectsAction =
    Prefs.getConfig(Config.tooManyProjectsAction) ?? cfg.d.manyProjectsAction;

  return cfg;
}

function watchConfigVarCb(name, cb) {
  State.disposal.add(
    nova.config.onDidChange(name, (nv, ov) => {
      // this doesn't send an update if a workspace override exists
      if (nova.workspace.config.get(name) == null) {
        if (nv != ov) {
          cb();
        }
      }
    })
  );
  State.disposal.add(
    nova.workspace.config.onDidChange(name, (nv, ov) => {
      // this always sends an update
      if (nv != ov) {
        cb();
      }
    })
  );
}

function watchConfigVar(name) {
  watchConfigVarCb(name, sendConfig);
}

function watchConfig() {
  watchConfigVar(Config.dubPath);
  watchConfigVar(Config.dmdPath);
  watchConfigVar(Config.projectImportPaths);
  watchConfigVar(Config.overrideEditorConfig);
  watchConfigVar(Config.braceStyle);
  watchConfigVar(Config.keepBreaks);
  watchConfigVar(Config.softLineLength);
  watchConfigVar(Config.hardLineLength);
  watchConfigVar(Config.alignSwitch);
  watchConfigVar(Config.compactLabeled);
  watchConfigVar(Config.breakAfterOp);
  watchConfigVar(Config.spaceAfterCast);
  watchConfigVar(Config.spaceBeforeFuncParams);
  watchConfigVar(Config.selectiveImportSpace);
  watchConfigVar(Config.spaceBeforeAAColon);
  watchConfigVar(Config.singleIndent);
  watchConfigVar(Config.templateConstraintStyle);
  watchConfigVar(Config.tooManyProjectsAction);
  watchConfigVar(Config.tooManyProjectsThreshold);
}

function watchConfigRestart() {
  watchConfigVarCb(Config.disableServer, restartClient);
  watchConfigVarCb(Config.useCustomServer, restartClient);
  watchConfigVarCb(Config.customServerPath, restartClient);
  watchConfigVarCb(Config.debugLsp, restartClient);
}

function register() {
  watchConfig();
  watchConfigRestart();
  State.registerCommand(Commands.restartServer, restartClient);
  State.emitter.on(State.events.onUpdate, restartClient);
  State.emitter.on(State.events.onActivate, startClient);
}

let ServeD = {
  deactivate: stopClient,
  sendRequest: sendRequest,
  getTasks: () => {
    return tasks;
  },
  register: register,
};
module.exports = ServeD;
