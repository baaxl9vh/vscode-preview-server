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
import { t } from './lang/cn';
import { output } from './output';
import { server } from './server';
import { getConfig, getFsPathOfFirstWorkspaceFolder, getMyFirstLanIp, getRelativePath } from './utils';


// Import the module and reference it with the alias vscode in your code below
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let statusBarItem: StatusBarItem;

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

	const charsets: string[] = [];
	for (let key in Charset) {
		charsets.push((Charset as any)[key]);
	}

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
		if (server.status === ServerStatus.running && event.removed.length > 0 && event.removed.findIndex((folder) => folder.uri.fsPath === currentWWWRoot) >= 0) {
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

	context.subscriptions.push(commands.registerCommand(Commands.restart, async () => {
		const result = await window.showQuickPick(charsets, {
			placeHolder: 'start preview server with charset',
		});
		if (result) {
			switch (server.status) {
				case ServerStatus.running:
					stopServer(() => {
						startServer(result);
					});
					break;
				case ServerStatus.stopped:
					startServer(result);
					break;
				case ServerStatus.starting:
				case ServerStatus.stopping:
					showStatusMessage(server.status);
					break;
				default:
					break;
			}
		}
	}));

	context.subscriptions.push(commands.registerCommand(Commands.open, () => {
		if (server.status === ServerStatus.running) {
			// server is running
			const wwwRoot = getFsPathOfFirstWorkspaceFolder();
			if (wwwRoot) {
				open(`http://${lanIp}:${port}${getRelativePath()}`);
			} else {
				window.showErrorMessage(t('NO_FOLDERS'));
			}
		} else {
			showStatusMessage(server.status);
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
	if (server.status === ServerStatus.stopped) {
		const wwwRoot = getFsPathOfFirstWorkspaceFolder();
		if (wwwRoot) {
			server.start(port, wwwRoot, charset).then(() => {
				currentWWWRoot = wwwRoot;
				statusBarItem.text = `Port ${port}`;
				statusBarItem.show();
				window.showInformationMessage(t('RESULT_START_SUC'));
				output.appendLine(`${LOG_TAG}: Listening on http://${lanIp}:${port}`);
			}).catch((err) => {
				let msg = `${LOG_TAG}: ${err.code} ${err.message}`;
				if (err.code === 'EADDRINUSE') {
					// 端口占用
					msg = `${t('PORT_USED')}${port}`;
				}
				window.showErrorMessage(msg);
			});
		} else {
			// 没有工作目录
			window.showErrorMessage(t('NO_FOLDERS'));
		}
	} else {
		showStatusMessage(server.status);
	}
}

function stopServer(callback?: () => void) {
	if (server.status === ServerStatus.running) {
		server.stop().finally(() => {
			currentWWWRoot = '';
			statusBarItem.hide();
			window.showInformationMessage(t('RESULT_STOPPED'));
			output.appendLine(t('RESULT_STOPPED'));
			if (typeof callback === 'function') {
				callback();
			}
		});
	} else {
		showStatusMessage(server.status);
	}
}

function showStatusMessage(status: string) {
	window.showInformationMessage(t(`SERVER_${status}`));
}

// this method is called when your extension is deactivated
export function deactivate() {
	if (statusBarItem) {
		statusBarItem.dispose();
	}
}
