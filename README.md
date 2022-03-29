# Minify All CLI

[![Node.js CI](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/node.js.yml/badge.svg)](https://github.com/jadiagaurang/minify-all-cli/actions/workflows/node.js.yml)

Minify All JS, CSS and HTML files in a folder by using UglifyJS, CSSNano and HTMLMinifier.

## Installation

```
npm install
```

## Code Example

### Prod
```
npx minify-all-cli -s "/home/ubuntu/source" -d "/home/ubuntu/compressed" --logLevel=info
```

### Local
```
node . -s "/home/ubuntu/source" -d "/home/ubuntu/compressed" --logLevel=info
```

## License

Please see the [license file](https://github.com/jadiagaurang/minify-all-cli/blob/main/LICENSE) for more information.