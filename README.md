# `sympm`

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

### Install
Creates a symlink from `./node_modules` to `~/.sympm/<currentDirBasename>/node_modules`
and runs `npm install`. You can then use `npm` normally with the new symlinked
`./node_modules` directory.

```bash
sympm install
```

### Uninstall
Removes installed modules in `~/.sympm/<currentDirBasename>/node_modules` by
running `rm -rf ~/.sympm/<currentDirBasename>/node_modules/*`.
```bash
sympm uninstall
```

### Clean
Removes all installed modules in `~/.sympm/*/node_modules/*` by running
`rm -rf ~/.sympm/*/node_modules/*`.
```bash
sympm clean
```

To remove the symlink, simply `rm ./node_modules` and you're good to go.

## License
MIT © [Ezekiel Gabrielse](https://github.com/ezekg)
