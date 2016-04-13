# `sympm`
[![Travis](https://img.shields.io/travis/ezekg/sympm.svg?style=flat-square)](https://travis-ci.org/ezekg/sympm)
[![NPM](https://img.shields.io/npm/v/sympm.svg?style=flat-square)](https://www.npmjs.com/package/sympm)

`sympm` allows you to run `npm install` from inside of a Vagrant virtual machine
without hitting symlink issues due to shared folders. It does so by symlinking
your local `node_modules/` directory to `~/.sympm/<currentDirBasename>/node_modules/`,
allowing `npm` to correctly symlink binaries and other goodies on `install`.

***This tool is not meant to be used outside of a virtual machine.***

## Installation
```bash
npm install -g sympm
```

## Usage
***The commands below should be run within your virtual machine via `vagrant ssh`.***

### Install
Creates a symlink from `./node_modules` to `~/.sympm/<currentDirBasename>/node_modules`
and runs `npm install`. You can then use `npm` normally with the new symlinked
`./node_modules` directory.

```bash
sympm install
```

### Uninstall
Removes modules installed in `~/.sympm/<currentDirBasename>` by running
`rm -rf ~/.sympm/<currentDirBasename>`, and removes the symlinked `./node_modules`
directory.

```bash
sympm uninstall
```

### Clean
Removes all modules installed in `~/.sympm/*` by running `rm -rf ~/.sympm/*`.

```bash
sympm clean
```

To remove the symlink, simply `rm ./node_modules` and you're good to go. To
completely uninstall `sympm`, remove the symlink and then run `rm -rf ~/.sympm`.

## License
MIT © [Ezekiel Gabrielse](https://github.com/ezekg)
