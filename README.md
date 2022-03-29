# Minify All CLI

[![Node.js CI](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/npm-publish.yml)

[![NPM Downloads](https://img.shields.io/npm/dw/minify-all-cli)](https://www.npmjs.com/package/minify-all-cli)

Minify All JS, CSS and HTML files in a folder by using UglifyJS, CSSNano and HTMLMinifier.

## Get Started

```bash
npm install
```

## Installation

```bash
npm install -g minify-all-cli
```

## Code Example

### Prod

```bash
npx minify-all-cli -s "/home/ubuntu/source" -d "/home/ubuntu/compressed" --logLevel=info
```

### Local

```bash
node . -s "/home/ubuntu/source" -d "/home/ubuntu/compressed" --logLevel=info
```

## License

Please see the [license file](https://github.com/jadiagaurang/minify-all-cli/blob/main/LICENSE) for more information.
