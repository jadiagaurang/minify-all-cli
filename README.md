# Minify All CLI

[![Node.js CI](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/node.js.yml)
[![Node.js Package](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/npm-publish.yml)
[![NPM Downloads](https://img.shields.io/npm/dw/minify-all-cli)](https://www.npmjs.com/package/minify-all-cli)

Minify All JS, CSS and HTML files in a folder by using UglifyJS, CSSNano and HTMLMinifier with an option to gzip all the files as well.

Package also supports processCount to set maximum degree of parallelism.

## Installation

```bash
npm install -g minify-all-cli
```

## Command Line Usage

```bash
minify-all-cli -s [source folder] -d [destination folder] [options]
```

### Command Line Options

```bash
Usage: -s <source> -d <destination>

Options:
      --help                Show help                                       [boolean]
      --version             Show version number                             [boolean]
  -j, --skipJS              Should minify JavaScript the file or skip it?   [boolean]
  -c, --skipCSS             Should minify CSS the file or skip it?          [boolean]
  -h, --skipHTML            Should minify HTML the file or skip it?         [boolean]
  -g, --doGzip              Should gzip the file or skip it?                [boolean]
  -x, --jsCompressor        Which JavaScript mangler/compressor to use for
                            minification? Default: uglifyjs                 [string]
  -m, --skipFileMasks       Partial Filder Path to skip minification        [array]
  -e, --skipFileExtensions  File Extensions to skip it over                 [array]
  -i, --ignoreFileMasks     Partial Filder Path to ignore minification and
                            copy to destination                             [array]
  -f, --configFile          Specifies a json configuration file for the
                            UglifyJS/terser, CSSNano and HTML Minifier 
                            module                                          [string]
  -l, --logLevel            Set log level to print warn, log, error, fatal
                            messages                                        [string]
  -p, --processCount        Specifies process count to set maximum degree
                            of parallelism                                  [number]
```

## CLI Example

### Prod

```bash
npx minify-all-cli \
-s "/home/ubuntu/source" -d "/home/ubuntu/compressed" \
--skipFileExtensions=.mp3 --skipFileExtensions=.mp4 \
--logLevel=warn
```

### Local

```bash
node . \
-s "./tests/asserts" -d "./tests/asserts_compressed" \
--skipFileExtensions=.mp3 --skipFileExtensions=.mp4 \
--logLevel=info
```

## License

Please see the [license file](https://github.com/jadiagaurang/minify-all-cli/blob/main/LICENSE) for more information.
