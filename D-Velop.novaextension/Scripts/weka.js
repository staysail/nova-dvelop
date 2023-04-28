//
// Copyright 2023 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// This module is for the benefit of Weka employees.
// It exposes Weka specific build recipes, when the workspace is opened on the
// main Weka repo.  It will not expose any tasks for non-Weka workspaces.

const State = require("./state.js");

const build_scripts = nova.path.join(nova.workspace.path, "scripts/build");
const wldc = nova.path.join(build_scripts, "wldc");
const check_all = nova.path.join(build_scripts, "check_all");

function resolveTaskAction(context) {
  let editor = nova.workspace.activeTextEditor;
  // TODO: Check for isDirty and offer to save?
  if (context.data == "check_file" && editor && editor.document.path) {
    return new TaskProcessAction(wldc, {
      args: [
        "-o-",
        "-vcolumns",
        nova.workspace.relativizePath(editor.document.path),
      ], // file?
      cwd: nova.workspace.path,
      matchers: ["dmd-error", "dmd-short-error"],
    });
  }  else if (context.data == "check_file_ut" && editor && editor.document.path) {
    return new TaskProcessAction(wldc, {
      args: [
        "-o-",
        "-g",
        "-vcolumns",
        "-unittest",
        nova.workspace.relativizePath(editor.document.path),
      ], // file?
      env: { QUIET: "true" },
      cwd: nova.workspace.path,
      matchers: ["dmd-error", "dmd-short-error", "d-exception-error" ],
    });
  } else if (context.data == "weka_ut" && editor && editor.document.path) {
    return new TaskProcessAction(wldc, {
      args: [
        "-unittest",
        "-main",
        nova.workspace.relativizePath(editor.document.path),
      ],
      env: {
        QUIET: "true",
        WLDC_MODE: "rdmd",
        ARCHFLAGS: "",
      },
      cwd: nova.workspace.path,
      matchers: ["dmd-error", "dmd-short-error", "d-exception-error"],
    })
  }
  // well this won't work
  return null;
}

function provideTasks() {
  if (
    !nova.workspace.contains(nova.path.join(nova.workspace.path, "weka")) ||
    !nova.workspace.contains(check_all) ||
    !nova.workspace.contains(wldc)
  ) {
    return [];
  }

  // We aren't localizing this... Weka staff all use English internally for
  // tools, etc.

  let cf_task = new Task("Check File");
  cf_task.setAction(
    Task.Build,
    new TaskResolvableAction({ data: "check_file" })
  );
  cf_task.image = "weka";

  let ut_task = new Task("Unit Test");
  ut_task.setAction(
    Task.Build,
    new TaskResolvableAction({ data: "check_file_ut" })
  );
  ut_task.setAction(
    Task.Run,
    new TaskResolvableAction({ data: "weka_ut" })
  );
  ut_task.image = "weka";

  let cl_task = new Task("Compile Locally");
  cl_task.setAction(
    Task.Build,
    new TaskProcessAction(check_all, {
      args: ["weka", "-vcolumns"],
      cwd: nova.workspace.path,
      matchers: ["dmd-error", "dmd-short-error"],
    })
  );
  cl_task.setAction(
    Task.Run,
    new TaskProcessAction(check_all, {
      args: ["weka", "-unittest", "-vcolumns"],
      cwd: nova.workspace.path,
      env: { QUIET: "true" },
      matchers: ["dmd-error", "dmd-short-error"],
    })
  );
  cl_task.image = "weka";
  return [cl_task, cf_task, ut_task];
}

function register() {
  let taskAssistant = nova.assistants.registerTaskAssistant(
    {
      resolveTaskAction: resolveTaskAction,
      provideTasks: provideTasks,
    },
    {
      identifier: "weka",
      name: "Weka",
    }
  );
  State.disposal.add(taskAssistant);
}

module.exports = {
  register: register,
};
