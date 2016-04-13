#!/usr/bin/env node
"use strict"

const untildify = require("untildify")
const chalk = require("chalk")
const meow = require("meow")
const cp = require("child_process")
const path = require("path")
const fs = require("fs")
const ora = require("ora")
var spinner

const cli = meow(`
  Usage
    $ sympm install
      Creates a symlink from ./node_modules to ~/.sympm/<currentDirBasename>/node_modules and runs npm install.
    $ sympm uninstall
      Removes modules installed in ~/.sympm/<currentDirBasename>.
    $ sympm clean
      Removes all modules installed in ~/.sympm/*.

  Options
    -q, --quiet    Suppress output from npm
    -v, --version  Print version

  Examples
    $ sympm install
`, {
  alias: {
    q: "quiet",
    v: "version"
  }
})

const showVersion = () => {
  console.log(cli.pkg.version)
  process.exit(0)
}

const printSuccess = (msg) => {
  console.log(chalk.green(msg))
}

const throwErr = (errMsg) => {
  console.log(chalk.red(errMsg))
  process.exit(1)
}

if (cli.flags.version) {
  showVersion()
}

const sympmDir = untildify(`~/.sympm`)
const moduleDir = path.join(sympmDir, path.basename(__dirname), "node_modules")

// Make sure ~/.sympm is accessible
try {
  fs.accessSync(sympmDir, fs.F_OK | fs.W_OK)
} catch (err) {
  if (err.code === "EACCES") {
    throwErr(`Access denied for ${sympmDir}. Please check the directory's permissions.`)
  }
}

// Make sure ~/.sympm/${moduleDir} is accessible
try {
  fs.accessSync(moduleDir, fs.F_OK | fs.W_OK)
} catch (err) {
  if (err.code === "EACCES") {
    throwErr(`Access denied for ${moduleDir}. Please check the directory's permissions.`)
  }

  // Create required directory structure
  let ps = cp.spawnSync("mkdir", ["-p", moduleDir], { stdio: [null, null, null] })
  if (ps.status !== 0) {
    throwErr(`Could not create ${moduleDir}. Please check the directory's permissions.`)
  }
}

switch (cli.input[0]) {

  // Create symlink to get node_modules out of shared folder territory and
  // then attempt to run `npm install` with the new setup
  case "install":
    spinner = ora({
      text: "Installing",
      color: "green"
    })

    try {
      cp.execSync(`ln -s ${moduleDir} ./node_modules`, { stdio: [null, null, null] })
    } catch (err) {
      throwErr(`Could not symlink ./node_modules -> ${moduleDir}. If ./node_modules already exists, try removing it first.`)
    } finally {
      spinner.stop()
    }

    let npm = cp.spawn("npm", ["install"])
    if (cli.flags.quiet) {
      spinner.start()
    } else {
      npm.stdout.on("data", (data) => {
        console.log(data.toString())
      })
      npm.stderr.on("data", (data) => {
        console.log(data.toString())
      })
    }

    npm.on("close", (code) => {
      spinner.stop()

      if (code !== 0) {
        throwErr(`Failed to successfully run npm install. Error log is likely in ./npm-debug.log.`)
      }

      printSuccess(`Successfully installed modules in ${moduleDir}.`)
    })

    break;

  // Remove everything from a single project, i.e. rm -rf ~/.sympm/${moduleDir}
  case "uninstall":
    spinner = ora({
      text: "Uninstalling",
      color: "yellow"
    })
    spinner.start()

    try {
      cp.execSync(`rm -rf ${moduleDir}`, { stdio: [null, null, null] })
    } catch (err) {
      throwErr(`Could not remove modules installed in ${moduleDir}.`)
    } finally {
      spinner.stop()
    }

    try {
      cp.execSync(`rm ./node_modules`, { stdio: [null, null, null] })
    } catch (err) {
      throwErr(`Could not remove symlink ./node_modules.`)
    } finally {
      spinner.stop()
    }

    printSuccess(`Successfully uninstalled modules from ${moduleDir}.`)
    break;

  // Remove everything from all projects, i.e. rm -rf ~/.sympm/*
  case "clean":
    spinner = ora({
      text: "Cleaning",
      color: "red"
    })
    spinner.start()

    try {
      cp.execSync(`rm -rf ${path.join(sympmDir, "*")}`, { stdio: [null, null, null] })
    } catch (err) {
      throwErr(`Could not clean modules installed in ${sympmDir}.`)
    } finally {
      spinner.stop()
    }

    printSuccess(`Successfully cleaned modules from ${sympmDir}.`)
    break;

  // Give 'em some help
  default:
    cli.showHelp()
}
