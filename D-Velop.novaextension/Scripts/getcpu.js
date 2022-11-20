//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const delay = require("./delay.js");
// We need to figure out what CPU architecture we are on.
// It would be *lots* easier if we had this in nova.environment or something.
// This has to be initialized early on.
let cpu = "";
var process = new Process("/usr/bin/uname", { args: ["-m"] });
process.onStdout((line) => {
  cpu = line.trim();
});
process.start();

async function getCpu() {
  let maxTime = 1000; // one second
  while (maxTime > 0) {
    if (cpu != "") {
      return cpu;
    }
    await delay(10); // try again in 10ms.
  }
  return null;
}

module.exports = getCpu;
