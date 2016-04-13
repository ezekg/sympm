"use strict"

const chai = require("chai")
const untildify = require("untildify")
const cp = require("child_process")
const fs = require("fs")
const path = require("path")

const homeDir = untildify("~")

const sympm = (args) => {
  try {
    const out = cp.execSync(["sympm"].concat(args).join(" "), { cwd: "./specs" })
    return out.toString()
  } catch (err) {
    return err.toString()
  }
}

describe("sympm", () => {

  describe("install", () => {
    var out

    beforeEach(() => {
      out = sympm("install")
    })

    afterEach(() => {
      sympm("uninstall")
    })

    it("should print output from npm", () => {
      chai.expect(out).to.match(/sympm@\d+\.\d+\.\d+/)
    })

    it("should create global ~/.sympm directory", () => {
      chai.expect(fs.statSync(`${homeDir}/.sympm`).isDirectory()).to.equal(true)
    })

    it("should create ~/.sympm/specs project directory", () => {
      chai.expect(fs.statSync(`${homeDir}/.sympm/specs`).isDirectory()).to.equal(true)
    })

    it("should install modules defined in the package.json", () => {
      chai.expect(fs.statSync(`${homeDir}/.sympm/specs/node_modules/meow`).isDirectory()).to.equal(true)
    })

    it("should create a symlink ~/.sympm/test/node_modules->./node_modules", () => {
      chai.expect(fs.lstatSync("specs/node_modules").isSymbolicLink()).to.equal(true)
    })
  })

  describe("uninstall", () => {

    beforeEach(() => {
      sympm("install")
      sympm("uninstall")
    })

    it("should remove installed modules in ~/.sympm/test/node_modules", () => {
      chai.expect(() => fs.statSync(`${homeDir}/.sympm/specs/node_modules/meow`)).to.throw(/ENOENT/)
    })

    it("should remove symlink ~/.sympm/test/node_modules->./node_modules", () => {
      chai.expect(() => fs.lstatSync("specs/node_modules")).to.throw(/ENOENT/)
    })
  })

  describe("clean", () => {

    beforeEach(() => {
      sympm("install")
      sympm("clean")
    })

    it("should remove installed modules in ~/.sympm/*", () => {
      chai.expect(() => fs.statSync(`${homeDir}/.sympm/specs`)).to.throw(/ENOENT/)
    })
  })
})
