// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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

// server status, 0未启动，1正在启动，2已启动，3正在停止
let serverStatus = STATUS_STOPPED;

// default server port
let port = 8900;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	output.show();

	// start server
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.startGBK', () => {
		startServer('GBK');
	}));
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.startServer', startServer));

	// stop server
	context.subscriptions.push(vscode.commands.registerCommand('preview-server.stopServer', () => {
		// stop server
		if (serverStatus === STATUS_STOPPED) {
			vscode.window.showInformationMessage('Preview Server 未启动');
		} else if (serverStatus === STATUS_STARTING) {
			vscode.window.showInformationMessage('Preview Server 正在启动，请等待完成启动再停止');
		} else if (serverStatus === STATUS_RUNNING) {
			serverStatus = 3;
			server.stop().then(() => {
				statusBarItem.hide();
				serverStatus = 0;
				vscode.window.showInformationMessage('Preview Server 已经停止');
			});
		} else if (serverStatus === STATUS_STOPPING) {
			vscode.window.showInformationMessage('Preview Server 正在停止，请稍等');
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('preview-server.open', () => {
		openBrowser();
	}));

	statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = `Port ${port}`;
	statusBarItem.command = 'preview-server.open';
	context.subscriptions.push(statusBarItem);

}

function startServer(charset) {
	// start server
	if (serverStatus === STATUS_STOPPED) {
		const folders = vscode.workspace.workspaceFolders;
		if (folders && Array.isArray(folders)) {
			if (folders.length === 1) {
				// single folder
				const wwwRoot = folders[0].uri.path;
				// 开始启动
				serverStatus = 1;
				server.start(port, wwwRoot, charset).then(() => {
					serverStatus = 2;
					statusBarItem.show();
					vscode.window.showInformationMessage('Preview Server 启动完成');
				}).catch((err) => {
					const msg = `Preview Server Error: ${err.code} ${err.message}`;
					vscode.window.showErrorMessage(msg);
				});
			} else {
				// multi root folder
				const msg = 'Preview Server Error: Current Workspace has multi root path!';
				vscode.window.showErrorMessage(msg);
			}
		} else {
			// 没有工作目录
			const msg = 'Preview Server Error: No Workspace Folders!';
			vscode.window.showErrorMessage(msg);
		}
	} else if (serverStatus === STATUS_STARTING) {
		vscode.window.showInformationMessage('Preview Server 正在启动');
	} else if (serverStatus === STATUS_RUNNING) {
		vscode.window.showInformationMessage('Preview Server 已经运行');
	} else if (serverStatus === STATUS_STOPPING) {
		vscode.window.showInformationMessage('Preview Server 正在停止，请稍等');
	}
}

function openBrowser() {
	open(`http://localhost:${port}`);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
