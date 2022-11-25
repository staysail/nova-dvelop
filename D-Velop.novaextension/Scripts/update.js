//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const GitHub = require("./github.js");
const Config = require("./config.js");
const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const extract = require("./extract.js");

const extPath = nova.extension.globalStoragePath;
const srvPath = nova.path.join(extPath, "serve-d");

async function checkForUpdate() {
  let beta = !!nova.config.get(Config.allowPreRelease);

  let releases = await GitHub.releases();
  let best = await GitHub.bestRelease(releases, beta);

  let next = nova.config.get(Config.releaseServeD);
  if (best != null && next != best.tag_name) {
    next = best.tag_name;
    nova.config.set(Config.releaseServeD, next);
  }
  let curr = nova.config.get(Config.currentServeD);
  if (curr && !nova.fs.access(srvPath, nova.fs.X_OK)) {
    console.error("We should have had a binary, but it appears to be missing.");
    curr = null;
  }

  if (curr == next && nova.fs.access(srvPath, nova.fs.X_OK)) {
    Messages.showNotice(Catalog.msgUpToDate, curr);
    console.log("Language server is current.");
    return true;
  }

  let title = Messages.getMsg(
    curr ? Catalog.msgNewServedTitle : Catalog.msgMissingServedTitle
  );
  let text = Messages.getMsg(
    curr ? Catalog.msgNewServedBody : Catalog.msgMissingServedBody
  );
  let n = new NotificationRequest("autoUpdate");
  n.title = title;
  n.body = text.replace("_VERSION_", next);
  n.actions = [
    Messages.getMsg(curr ? Catalog.msgUpdate : Catalog.msgInstall),
    Messages.getMsg(Catalog.msgCancel),
  ];
  let response = await nova.notifications.add(n);
  if (response == null) {
    return null;
  }
  if (response.actionIdx != 0) {
    return false;
  }
  // do it!
  let path = await GitHub.downloadAsset(best, nova.fs.tempdir);

  let result = null;
  try {
    console.log("Extracting", path);
    let result = extract(path, extPath, (status) => {
      if (status == 0) {
        // let's remove the temporary asset since we're done with it.
        nova.fs.remove(path);
        // notify watchers (should cause a reboot)
        State.emitter.emit(State.events.onUpdate);
        nova.config.set(Config.currentServeD, best.tag_name);
      } else {
        console.error("Update failed", status);
      }
    });
  } catch (e) {
    console.error(e.message);
  }

  return result;
}

//nova.commands.register(Commands.checkForUpdate, async function (_) {

async function checkForUpdateCmd() {
  if (prefs.config.disableServer) {
    Messages.showNotice(
      Catalog.msgLspDisabledTitle,
      Catalog.msgLspDisabledTitle
    );
    return;
  }
  if (Prefs.config.useCustomServer) {
    Messages.showNotice(
      Catalog.msgLspIsCustomTitle,
      Catalog.msgLspIsCustomBody
    );
    return;
  }
  try {
    await checkForUpdate(true);
  } catch (error) {
    Messages.showError(error.message);
  }
}

async function checkForUpdateSilent() {
  // If we should check for new versions at start up, try to download from
  // GitHub releases.  But we don't do this if the server is disabled or we
  // are using a custom server.
  if (Prefs.getConfig(Config.disableServer)) {
    return;
  }
  if (Prefs.getConfig(Config.useCustomServer)) {
    return;
  }
  if (nova.config.get(Config.checkForUpdates)) {
    // if it doesn't work, don't bother warning about it.
    try {
      await checkForUpdate();
    } catch (error) {}
  }
}

function onStart() {
  checkForUpdateSilent();
  // consider restarting this periodically, but we need to make
  // make sure that we only do it once for the entire editor, not
  // per server.
}

function register() {
  State.registerCommand(Commands.checkForUpdate, checkForUpdateCmd);
  State.emitter.on(State.events.onActivate, onStart);

  // save the version (we're going to use this in the legacy version to
  // find us)
  if (nova.config.get(Config.version) != nova.extension.version) {
    nova.config.set(Config.version, nova.extension.version);
  }
}

module.exports = { register: register };
