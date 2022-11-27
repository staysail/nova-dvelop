//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Cache = require("./cache.js");
const getCpu = require("./getcpu.js");

const repoUrl = "https://api.github.com/repos/Pure-D/serve-d";
const tmpDir = nova.fs.tempdir;
const novaVersion = "nova " + nova.versionString;
const macosVersion = "macos " + nova.systemVersion.join(".");
const extName = nova.extension.name;
const extVersion = nova.extension.versionString;
const userAgent = `${extName}/${extVersion} (${novaVersion} ${macosVersion})`;
const earliestSupported = "v0.8.0-beta.1";
const releasesUrl = `${repoUrl}/releases`;

// return true if v1 is newer than v2
function isNewer(vers1, vers2) {
  let v1 = vers1;
  let v2 = vers2;
  // we don't expect to get a nightly, ever
  // we assume tagged releases have a "v0.1.3[-beta.Z] format.
  // RC are considered newer than beta.
  if (!v1.startsWith("v")) {
    return true;
  }
  if (!v2.startsWith("v")) {
    return false;
  }
  if (!v1.startsWith("v") || !v2.startsWith("v")) {
    return undefined;
  }
  v1 = v1.substr(1);
  v2 = v2.substr(1);

  let a1 = v1.split("-");
  let a2 = v2.split("-");

  if (a1[0] != a2[0]) {
    let m1 = a1[0].split(".");
    let m2 = a2[0].split(".");

    if (Number(m1[0]) != Number(m2[0])) {
      return Number(m1[0]) > Number(m2[0]);
    }
    if (Number(m1[1]) != Number(m2[1])) {
      return Number(m1[1]) > Number(m2[1]);
    }
    return Number(m1[2]) > Number(m2[2]);
  }
  // same version, only suffixes differ
  if (a1[1] == "") {
    return false;
  }
  if (a2[1] == "") {
    return true;
  }

  // hopefully we have something like beta.7 or rc.1
  let br1 = a1[1].split(".");
  let br2 = a2[1].split(".");
  if (br1[0] != br2[0]) {
    // NB: rc > beta
    return br1[0] > br2[0];
  }
  // final bit is the number
  return Number(br1[1]) > Number(br2[1]);
}

class GitHub {
  static findAsset(release, cpu = "universal") {
    // skip over releases with an artifact we can use
    // for the moment this does not accommodate rosetta2 -- since
    // we have ARM binaries available.
    if (!release || !release.assets) {
      return null;
    }
    let ending1 = "-osx-universal.tar.xz";
    let ending2 = "-osx-" + cpu + ".tar.xz";
    for (let a of release.assets) {
      // prefer universal binaries for now
      let an = a.name;
      if (an.endsWith(ending1)) {
        return a;
      }
      if (an.endsWith(ending2)) {
        return a;
      }
    }
    return null;
  }

  // releases returns a promise that resolves to a GitHub releases object for language server.
  // It should be an array of items, each item corresponding to a release.
  // Within each release may be an array of associated assets.
  static releases(force) {
    // My instinct is that there is probably a better way to do this,
    // but I'm not a Javascript expert.  Would be grateful for any
    // suggestions to clean it up.
    //
    // This code has support for using caching, if Nova ever exposes ETags to
    // us, or if the Last-Modified header is present in GitHub (it isn't for
    // these requests for some reason, although the releases/latest header does
    // in fact have it.  GraphQL would be better if it were supported for
    // unauthenticated users.
    //
    // No support for pagination is present, though GitHub does have it, and
    // has a configurable limit of 30 releases per page (100 max).  We are
    // not bothering with that, assuming that the first page has the newest
    // stuff, and there won't be an obscene number of new releases.
    //
    // This check needs to be done infrequently, because it can be expensive.
    // We actually prefer it be done only manually.
    return Cache.fetch(
      "releases",
      releasesUrl,
      {
        headers: { Accept: "application/vnd.github+json" },
      },
      force
    );
  }

  // choose the best release from the list of available releases
  // if beta is true, then we will prefer betas.  otherwise we only
  // fallback to a beta if no formal release is available.  returns a promise.
  static async bestRelease(releases, beta = false) {
    let bestRel = null;
    let bestPre = null;

    let cpu = await getCpu();

    if (!Array.isArray(releases)) {
      Messages.showError("BUG: Value to bestRelease is not an array");
      return null;
    }
    for (let r of releases) {
      if (r.tag_name == "nightly") {
        continue; // skip nightly builds for now
      }
      if (!this.findAsset(r, cpu)) {
        continue;
      }

      // refuse to work with the ancient stuff - old versions don't work
      if (!isNewer(r.tag_name, earliestSupported)) {
        continue;
      }

      // This is somewhat naive, and will fall apart in the face
      // of branches if an older branch gets a patch update before
      // a newer one.  But as serve-d is still pre1.0, we aren't
      // terrifically worried about it.  So we just use the date.
      if (r.prerelease) {
        if (bestPre == null || isNewer(r.tag_name, bestPre.tag_name)) {
          bestPre = r;
        }
      } else {
        if (bestRel == null || isNewer(r.tag_name, bestRel.tag_name)) {
          bestRel = r;
        }
      }
    }
    // we take the beta if it's all we have, or we want betas and the
    // beta is *newer* than the release (the release might the latest)
    if (bestRel == null || (beta && isNewer(bestPre, bestRel))) {
      return bestPre;
    }
    return bestRel;
  }

  // this attempts to download a specific asset, which should be supplied.
  // it returns a promise that resolves to the saved asset path.
  static async downloadAsset(release, dir = tmpDir) {
    let cpu = await getCpu();
    let asset = this.findAsset(release, cpu);
    let path = nova.path.join(dir, asset.name);
    if (!asset) {
      // we don't expect to be here
      throw new Error("Asset no found for release " + release.tag_name);
    }
    console.log("Starting download of", asset.url, "into", dir);

    let response = await fetch(asset.url, {
      headers: { Accept: "application/octet-stream", "User-Agent": userAgent },
    });

    if (!response.ok) {
      console.error("Failed GitHub", response.status, response.statusText);
      return null;
    }

    let ab = await response.arrayBuffer();
    try {
      let f = nova.fs.open(path, "wb");
      f.write(ab);
      f.close();
    } catch (e) {
      // clean up the file if it is there (it's probably garbage)
      nova.fs.remove(path);
      Messages.showError(Catalog.msgDownloadFailed);
      console.error("Failed to download asset", e.message);
      return null;
    }
    return path;
  }
}

module.exports = GitHub;
