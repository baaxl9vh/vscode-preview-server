// The module 'vscode' contains the VS Code extensibility API
import * as open from 'open';
import { commands, ExtensionContext, StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';

import {
  Charset,
  Commands,
  CONFIG_SECTION,
  ConfigKeys,
  DEFAULT_CHARSET,
  DEFAULT_SERVER_PORT,
  LOG_TAG,
  ServerStatus,
} from './constants';
import { output } from './output';
import { server } from './server';
import { getConfig, getFsPathOfFirstWorkspaceFolder, getMyFirstLanIp, getRelativePath } from './utils';


// Import the module and reference it with the alias vscode in your code below
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let statusBarItem: StatusBarItem;

// server status, 0未启动，1正在启动，2已启动，3正在停止
let serverStatus = ServerStatus.stopped;

// server serve path
let currentWWWRoot = '';

// default server port
let port = DEFAULT_SERVER_PORT;

// lan ip or localhost
let lanIp = '';

/**
 * @param {ExtensionContext} context
 */
export function activate(context: ExtensionContext) {

	output.show();

	lanIp = getMyFirstLanIp() || 'localhost';

	port = getConfig(ConfigKeys.port) as number;
	let charset = getConfig(ConfigKeys.charset) as string;

	// config changed after extension activate
	workspace.onDidChangeConfiguration((event) => {
		if (event.affectsConfiguration(CONFIG_SECTION)) {
			port = getConfig(ConfigKeys.port) as number;
			charset = getConfig(ConfigKeys.charset) as string;
		}
	});

	workspace.onDidChangeWorkspaceFolders((event) => {
			// running
		if (serverStatus === ServerStatus.running && event.removed.length > 0 && event.removed.findIndex((folder) => folder.uri.fsPath === currentWWWRoot) >= 0) {
			stopServer();
		}
	});

	// start server
	context.subscriptions.push(commands.registerCommand(Commands.startGbk, () => {
		startServer(Charset.gbk);
	}));
	context.subscriptions.push(commands.registerCommand(Commands.start, () => {
		startServer(charset);
	}));

	// stop server
	context.subscriptions.push(commands.registerCommand(Commands.stop, () => {
		stopServer();
	}));

	context.subscriptions.push(commands.registerCommand(Commands.open, () => {
		if (serverStatus === ServerStatus.running) {
			// server is running
			const wwwRoot = getFsPathOfFirstWorkspaceFolder();
			if (wwwRoot) {
				open(`http://${lanIp}:${port}${getRelativePath()}`);
			} else {
				window.showErrorMessage(`${LOG_TAG}: No workspace folders!`);
			}
		} else {
			window.showInformationMessage(`${LOG_TAG}: Server is NOT running.`);
		}
	}));

	statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
	statusBarItem.command = Commands.open;
	context.subscriptions.push(statusBarItem);

}

function startServer(charset: string) {
	if (!charset) {
		charset = DEFAULT_CHARSET;
	}
	// start server
	if (serverStatus === ServerStatus.stopped) {
		const wwwRoot = getFsPathOfFirstWorkspaceFolder();
		if (wwwRoot) {
			serverStatus = ServerStatus.starting;
			server.start(port, wwwRoot, charset).then(() => {
				currentWWWRoot = wwwRoot;
				serverStatus = ServerStatus.running;
				statusBarItem.text = `Port ${port}`;
				statusBarItem.show();
				window.showInformationMessage(`${LOG_TAG}: Start successful.`);
				output.appendLine(`${LOG_TAG}: Listening on http://${lanIp}:${port}`);
			}).catch((err) => {
				serverStatus = ServerStatus.stopped;
				let msg = `${LOG_TAG}: ${err.code} ${err.message}`;
				if (err.code === 'EADDRINUSE') {
					// 端口占用
					msg = `${LOG_TAG}: Port ${port} already in use`;
				}
				window.showErrorMessage(msg);
			});
		} else {
			// 没有工作目录
			const msg = `${LOG_TAG}: No workspace folders!`;
			window.showErrorMessage(msg);
		}
	} else if (serverStatus === ServerStatus.starting) {
		window.showInformationMessage(`${LOG_TAG}: Server is starting.`);
	} else if (serverStatus === ServerStatus.running) {
		window.showInformationMessage(`${LOG_TAG}: Server is running.`);
	} else if (serverStatus === ServerStatus.stopping) {
		window.showInformationMessage(`${LOG_TAG}: Server is stopping.`);
	}
}

function stopServer() {
	if (serverStatus === ServerStatus.stopped) {
		window.showInformationMessage(`${LOG_TAG}: Server is NOT running.`);
	} else if (serverStatus === ServerStatus.starting) {
		window.showInformationMessage(`${LOG_TAG}: Server is starting. Please wait seconds.`);
	} else if (serverStatus === ServerStatus.running) {
		serverStatus = ServerStatus.stopping;
		server.stop().finally(() => {
			currentWWWRoot = '';
			statusBarItem.hide();
			serverStatus = ServerStatus.stopped;
			window.showInformationMessage(`${LOG_TAG}: Server is stopped now.`);
			output.appendLine(`${LOG_TAG}: Server is stopped now.`);
		});
	} else if (serverStatus === ServerStatus.stopping) {
		window.showInformationMessage(`${LOG_TAG}: Server is stopping. Please wait seconds.`);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}
