import { networkInterfaces } from 'os';
import { window, workspace } from 'vscode';

import { CONFIG_SECTION, ConfigKeys, DEFAULT_SERVER_PORT } from './constants';

export function getMyFirstLanIp() {
	// all interfaces
	const interfaces = networkInterfaces();
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
export function getFsPathOfFirstWorkspaceFolder() {
	let fsPath;
	const folders = workspace.workspaceFolders;
	if (folders && Array.isArray(folders) && folders.length > 0) {
		fsPath = folders[0].uri.fsPath;
	}
	return fsPath;
}

export function getRelativePath () {
  let pathname = '';
  const root = getFsPathOfFirstWorkspaceFolder();
  if (root && window.activeTextEditor && window.activeTextEditor.document.uri.fsPath.startsWith(root)) {
    pathname = window.activeTextEditor.document.uri.fsPath.replace(root, '');
  }
  return pathname;
}

export function getConfig(key: ConfigKeys): string | number | undefined {
  const config = workspace.getConfiguration(CONFIG_SECTION);
  if (key === ConfigKeys.port) {
		return (config.get<number>(ConfigKeys.port) || DEFAULT_SERVER_PORT);
  } else if (key === ConfigKeys.charset) {
		return (config.get(ConfigKeys.charset) || DEFAULT_SERVER_PORT);
  } else {
    return undefined;
  }
}