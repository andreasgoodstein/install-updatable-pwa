#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const util = require("util");

const copyFilePromise = util.promisify(fs.copyFile);

// root path resolves to ./bin/
const packageRoot = path.join(__dirname, "/..", "/lib");
const localRoot = "./";

// files to copy
const libraryFileList = [
  "icon-192.png",
  "icon-512.png",
  "manifest.webmanifest",
  "register_sw.ts",
  "service_worker.ts",
];

// copy pwa files to current folder
copyFiles(packageRoot, localRoot, libraryFileList)
  .then(() => {
    logCompleteMessage();
  })
  .catch((error) => {
    throw error;
  });

// map list of files into Promise.all
function copyFiles(srcDir, destDir, fileList) {
  return Promise.all(
    fileList.map((file) => {
      return copyFilePromise(
        path.join(srcDir, file),
        path.join(destDir, file),
        fs.constants.COPYFILE_EXCL
      );
    })
  );
}

// output user guide
function logCompleteMessage() {
  console.log(
    `
    PWA files copied      
    Complete the following steps to enable the updatable PWA
  
    1. Implement handlePWAUpdate() callback in register_sw.js
    2. Customize manifest.webmanifest to your needs (replace icons, names, etc.)
    3. Project is Typescript, so use bundler of choice or tsc to compile/transpile into target ES version
    4. Load webmanifest and register_sw.ts in main html via <link> and <script> tags
    `
  );
}
