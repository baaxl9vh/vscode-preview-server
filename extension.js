// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const os = require('os');
const vscode = require('vscode');
const open = require('open');
const server = require('./server');
const output = require('./output');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let statusBarItem;

// 未启动，停止状态
const STATUS_STOPPED = 0;
// 正在启动
const STATUS_STARTING = 1;
// 完成启动，正在运行
const STATUS_RUNNING = 2;
// 正在停止
const STATUS_STOPPING = 3;

// configuration section name
const CONFIG_SECTION = 'previewServer';

// info name
const INFO_NAME = 'Preview Server';

// server status, 0未启动，1正在启动，2已启动，3正在停止
let serverStatus = STATUS_STOPPED;

// server serve path
let currentWWWRoot = '';

// default server port
let port = 8900;

// default charset
const DEFAULT_CHARSET = 'UTF-8';

// lan ip or localhost
let lanIp = '';

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	output.show();

	lanIp = getMyFirstLanIp() || 'localhost';

	let charset = DEFAULT_CHARSET;

	// read config
	// webServerPort, webServerCharset
	let config = vscode.workspace.getConfiguration(CONFIG_SECTION);
	if (config.has('webServerPort')) {
		port = config.get('webServerPort');
	}

	if (config.has('webServerCharset')) {
		charset = config.get('webServerCharset');
	}

	// config changed after extension activate
	vscode.workspace.onDidChangeConfiguration((e) => {
		if (e.affectsConfiguration(CONFIG_SECTION)) {
			config = vscode.workspace.getConfiguration(CONFIG_SECTION);
			if (config.has('webServerPort')) {
				port = config.get('webServerPort');
			}
			if (config.has('webServerCharset')) {
				charset = config.get('webServerCharset');
			}
		}
	});

	vscode.workspace.onDidChangeWorkspaceFolders((e) => {
		if (serverStatus === STATUS_RUNNING) {
			// running
			if (e.removed.length > 0) {
				// remove one or more
				for (let folder of e.removed) {
					if (currentWWWRoot === folder.uri.fsPath) {
						// server's wwwroot removed, and server is running, stop it.
						stopServer();
						break;
					}
				}
			}
		}
	});

	// start server
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.startGBK', () => {
		startServer('GBK');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.startServer', () => {
		startServer(charset);
	}));

	// stop server
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.stopServer', () => {
		stopServer();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('preview-server.open', () => {
		if (serverStatus === STATUS_RUNNING) {
			// server is running
			const wwwRoot = getFsPathOfFirstWorkspaceFolder();
			if (wwwRoot) {
				let pathname = '';
				if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document.uri.fsPath.startsWith(wwwRoot)) {
					pathname = vscode.window.activeTextEditor.document.uri.fsPath.replace(wwwRoot, '');
				}
				open(`http://${lanIp}:${port}${pathname}`);
			} else {
				const msg = `${INFO_NAME}: No workspace folders!`;
				vscode.window.showErrorMessage(msg);
			}
		} else {
			vscode.window.showInformationMessage(`${INFO_NAME}: Server is NOT running.`);
		}
	}));

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'preview-server.open';
	context.subscriptions.push(statusBarItem);

}

function startServer(charset) {
	if (!charset) {
		charset = DEFAULT_CHARSET;
	}
	// start server
	if (serverStatus === STATUS_STOPPED) {
		const wwwRoot = getFsPathOfFirstWorkspaceFolder();
		if (wwwRoot) {
			serverStatus = STATUS_STARTING;
			server.start(port, wwwRoot, charset).then(() => {
				currentWWWRoot = wwwRoot;
				serverStatus = STATUS_RUNNING;
				statusBarItem.text = `Port ${port}`;
				statusBarItem.show();
				vscode.window.showInformationMessage(`${INFO_NAME}: Start successful.`);
				output.appendLine(`${INFO_NAME}: Listening on http://${lanIp}:${port}`);
			}).catch((err) => {
				serverStatus = STATUS_STOPPED;
				let msg = `${INFO_NAME}: ${err.code} ${err.message}`;
				if (err.code === 'EADDRINUSE') {
					// 端口占用
					msg = `${INFO_NAME}: Port ${port} already in use`;
				}
				vscode.window.showErrorMessage(msg);
			});
		} else {
			// 没有工作目录
			const msg = `${INFO_NAME}: No workspace folders!`;
			vscode.window.showErrorMessage(msg);
		}
	} else if (serverStatus === STATUS_STARTING) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is starting.`);
	} else if (serverStatus === STATUS_RUNNING) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is running.`);
	} else if (serverStatus === STATUS_STOPPING) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is stopping.`);
	}
}

function stopServer() {
	if (serverStatus === STATUS_STOPPED) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is NOT running.`);
	} else if (serverStatus === STATUS_STARTING) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is starting. Please wait seconds.`);
	} else if (serverStatus === STATUS_RUNNING) {
		serverStatus = STATUS_STOPPING;
		server.stop().finally(() => {
			currentWWWRoot = '';
			statusBarItem.hide();
			serverStatus = STATUS_STOPPED;
			vscode.window.showInformationMessage(`${INFO_NAME}: Server is stopped now.`);
			output.appendLine(`${INFO_NAME}: Server is stopped now.`);
		});
	} else if (serverStatus === STATUS_STOPPING) {
		vscode.window.showInformationMessage(`${INFO_NAME}: Server is stopping. Please wait seconds.`);
	}
}

function getMyFirstLanIp() {
	// all interfaces
	const interfaces = os.networkInterfaces();
	let lanIp;
	for (let key in interfaces) {
		const ips = interfaces[key];
		if (ips) {
			for (let ip of ips) {
				if (ip.family === 'IPv4' && !ip.internal) {
					const address = ip.address;
					// start with 10, 172, 192
					if (address.startsWith('10') || address.startsWith('172') || address.startsWith('192')) {
						// found, only first, break;
						lanIp = address;
						break;
					}
				}
			}
		}
		if (lanIp) {
			// found, break
			break;
		}
	}
	return lanIp;
}

/**
 * 
 * @returns fsPath 当前工作目录绝对地址
 */
function getFsPathOfFirstWorkspaceFolder() {
	let fsPath;
	const folders = vscode.workspace.workspaceFolders;
	if (folders && Array.isArray(folders) && folders.length > 0) {
		fsPath = folders[0].uri.fsPath;
	}
	return fsPath;
}

// this method is called when your extension is deactivated
function deactivate() {
	if (statusBarItem) statusBarItem.dispose();
}

module.exports = {
	activate,
	deactivate
}
