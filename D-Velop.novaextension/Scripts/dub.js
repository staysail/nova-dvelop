//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// This first version just uses /usr/bin/env dub ... but we will
// follow up soon with proper integration with serve-d.

const Commands = require("./commands.js");
const Paths = require("./paths.js");

let lspServer = null;

// Group names are clean, build, rebuild, and test.
// We create special providers for each of them.

function taskType(t) {
  if (t.run || t.test) {
    return Task.Run;
  }
  return Task.Build;
}

function provideTasksGroup(group) {
  let newTasks = [];
  if (lspServer) {
    let tasks = lspServer.getTasks();
    if (!tasks || !tasks[group]) {
      return [];
    }
    for (let t of tasks[group]) {
      if (!t.exec.startsWith("/")) {
        t.args.unshift(t.exec);
        t.exec = "/usr/bin/env";
      }
      let task = new Task(t.name);
      task.setAction(
        taskType(t),
        new TaskProcessAction(t.exec, {
          args: t.args,
          cwd: t.cwd,
          matchers: ["dmd-error", "dmd-short-error"],
        })
      );
      if (t.run) {
        task.persistent = true;
      }
      task.image = "dub";
      newTasks.push(task);
    }
    return newTasks;
  }
  return [];
}

let searchPaths = [
  "/Library/D/dmd/bin",
  "/usr/bin",
  "/usr/local/bin",
  "/opt/homebrew/bin",
];

function findDub() {
  return Paths.findProgram(searchPaths, ["dub"]);
}

function findDmd() {
  return Paths.findProgram(searchPaths, ["dmd", "ldmd2", "ldmd", "gdmd"]);
}

function registerTaskGroups() {
  nova.assistants.registerTaskAssistant(
    { provideTasks: () => provideTasksGroup("build") },
    { identifier: "dub-build", name: "Dub Build" }
  );
  nova.assistants.registerTaskAssistant(
    { provideTasks: () => provideTasksGroup("rebuild") },
    { identifier: "dub-rebuild", name: "Dub Rebuild" }
  );
  nova.assistants.registerTaskAssistant(
    { provideTasks: () => provideTasksGroup("test") },
    { identifier: "dub-test", name: "Dub Test" }
  );
  nova.assistants.registerTaskAssistant(
    { provideTasks: () => provideTasksGroup("clean") },
    { identifier: "dub-clean", name: "Dub Clean" }
  );
}

function register() {
  nova.commands.register(Commands.findDub, findDub);
  nova.commands.register(Commands.findDmd, findDmd);
  registerTaskGroups();
}

let Dub = {
  setLspServer: (lsp) => {
    lspServer = lsp;
  },

  reloadTasks: () => {
    nova.workspace.reloadTasks("dub-build");
    nova.workspace.reloadTasks("dub-rebuild");
    nova.workspace.reloadTasks("dub-test");
    nova.workspace.reloadTasks("dub-clean");
  },

  register: register,
};

module.exports = Dub;
