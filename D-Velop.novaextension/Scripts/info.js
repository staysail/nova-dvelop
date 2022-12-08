//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Lsp = require("./served.js");
const State = require("./state.js");

// much of this logic was adapted from the Nova Typescript
// extension by Cameron Little, which carried this Copyright:
//
// Copyright (c) 2020 Cameron Little
//
// A fair number of local changes were made as well, to more closely
// match the way Nova presents things for it's own searches.

let files = [];
let matches = {};

let status = "Inactive";
let name = "";
let version = "";
let reason = "";

function infoTreeProvider() {
  return {
    getChildren(element) {
      if (element == null) {
        list = ["status"];
        if (name || version) {
          list.push("server");
        }
        // if (reason) {
        //   list.push("error");
        // }
        return list; // could put other stuff here too
      }
      return [];
    },
    getTreeItem(element) {
      if (typeof element == "string") {
        switch (element) {
          case "status":
            item = new TreeItem("LSP Status", TreeItemCollapsibleState.None);
            item.descriptiveText = status;
            item.tooltip = reason;
            item.image = "d-mono-small";
            return item;
          case "server":
            item = new TreeItem("LSP Server", TreeItemCollapsibleState.None);
            item.descriptiveText = name + " " + version;
            item.image = "__builtin.path";
            return item;
          case "error":
            item = new TreeItem("LSP Error", TreeItemCollapsibleState.None);
            item.descriptiveText = reason;
            return item;
        }
      } else {
        return null;
      }
    },
  };
}

let infoTv = null;

async function getServerInfo(editor) {
  try {
    let result = await Lsp.sendRequest("served/getInfo", {});
    status = "Running";
    name = result.serverInfo.name;
    version = result.serverInfo.version;
    reason = "";
  } catch (err) {
    status = "Inactive";
    reason = err;
  }

  infoTv.reload();
}

function onLsp(lspStatus) {
  status = Messages.getMsg(lspStatus.state);
  name = lspStatus.name;
  version = lspStatus.version;
  reason = lspStatus.error;
  infoTv.reload();
}

function register() {
  infoTv = new TreeView("dvelop.sidebar.info", {
    dataProvider: infoTreeProvider(),
  });

  State.disposal.add(infoTv);
  State.emitter.on(State.events.onLsp, onLsp);
  State.registerCommand(Commands.serverInfo, (editor) => getServerInfo(editor));
}

module.exports = { register: register };
