//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const GitHub = require("./github.js");
const Config = require("./config.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const extract = require("./extract.js");

const extPath = nova.extension.globalStoragePath;
const srvPath = nova.path.join(extPath, "serve-d");

let updateEmitter = new Emitter();

function emitUpdate() {
  updateEmitter.emit("update");
}
class Update {
  static onUpdate(cb) {
    updateEmitter.on("update", cb);
  }

  // checkForUpdate fires off an asynchronous test to see if a new release
  // is available.  If one is, it will issue a notification.
  static async checkForUpdate() {
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
      console.error(
        "We should have had a binary, but it appears to be missing."
      );
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

    try {
      console.log("Extracting", path);
      let status = extract(path, extPath, (status) => {
        if (status == 0) {
          // let's remove the temporary asset since we're done with it.
          nova.fs.remove(path);
          emitUpdate();
          nova.config.set(Config.currentServeD, best.tag_name);
        } else {
          console.error("Update failed", status);
        }
      });
    } catch (e) {
      console.error(e.message);
    }

    return status;
  }
}

module.exports = Update;
