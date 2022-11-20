//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are configuration parameters. If public they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

// This first version just uses /usr/bin/env dub ... but we will
// follow up soon with proper integration with serve-d.

let Dub = {
  provideTasks: () => {
    if (
      nova.workspace.contains(
        nova.path.join(nova.workspace.path, "dub.json")
      ) ||
      nova.workspace.contains("dub.sdl")
    ) {
      let task = new Task("DUB");
      task.setAction(
        Task.Build,
        new TaskProcessAction("/usr/bin/env", {
          args: ["dub", "build", "-q"],
          matchers: ["dmd-error"],
        })
      );
      task.setAction(
        Task.Clean,
        new TaskProcessAction("/usr/bin/env", {
          args: ["dub", "clean"],
          matchers: ["dmd-error"],
        })
      );
      task.setAction(
        Task.Run,
        new TaskProcessAction("/usr/bin/env", {
          args: ["dub", "run"],
          matchers: ["dmd-error"],
        })
      );
      task.image = "dub";
      return [task];
    }
    return [];
  },
};

module.exports = Dub;
