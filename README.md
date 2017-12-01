# react-scripts-facade

Extract of wmonk/create-react-app-typescript/ react-scripts/scripts and react-scripts/bin folders.

## Options

### `entryDir` in `package.json`

Setup a folder where all files are used as entry points.

> Note: All entries are build with config.output.library = 'Bundle'; This mean you can get the export of the bundle in
> window.Bundle.

### env ENTRY_FILE

Control the boot entry file (src/index.tsx by default)

### env OUTPUT_DIR

Control the output directory (build by default).
