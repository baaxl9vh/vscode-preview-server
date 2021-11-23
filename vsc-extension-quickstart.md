# VSCode 编写说明

## Your First Extension

Make sure you have Node.js and Git installed, then install Yeoman and VS Code Extension Generator with:

```shell
npm install -g yo generator-code
```

Run generator to generate the project of extension.

```shell
yo code
```

Then, inside the editor, press F5. This will compile and run the extension in a new Extension Development Host window.

## Publishing Extensions

vsce, short for "Visual Studio Code Extensions", is a command-line tool for packaging, publishing and managing VS Code extensions.

```shell
npm install -g vsce
```

```shell
vsce login <publishId>
# then input token
vsce package
vsce publish
```

## Bundling Extensions

esbuild is a fast bundler that's simple to configure. To acquire esbuild, open the terminal and type:

```shell
npm i --save-dev esbuild
```

You can run esbuild from the command line but to reduce repetition, using npm scripts is helpful.

Merge these entries into the scripts section in package.json:

```json
"scripts": {
    "vscode:prepublish": "npm run esbuild-base -- --minify",
    "esbuild-base": "esbuild ./src/extension.ts --bundle --outfile=out/main.js --external:vscode --format=cjs --platform=node",
    "esbuild": "npm run esbuild-base -- --sourcemap",
    "esbuild-watch": "npm run esbuild-base -- --sourcemap --watch",
    "test-compile": "tsc -p ./"
},
```

## Github CI

<https://code.visualstudio.com/api/working-with-extensions/continuous-integration#github-actions>

## 参考

[https://code.visualstudio.com/api](https://code.visualstudio.com/api)
