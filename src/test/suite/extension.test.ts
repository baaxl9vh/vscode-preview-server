import * as assert from 'assert';
import axios from 'axios';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

import { Charset, Commands, ConfigKeys, DEFAULT_CHARSET, DEFAULT_SERVER_PORT } from '../../constants';
import { getConfig } from '../../utils';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// import * as myExtension from '../../extension';

const EXTENSION_ID = 'jjjjkkkk.preview-server';
const COMMAND_PREFIX = 'preview-server';

suite('Extension Test Suite', async () => {

	test('should have this extension', () => {
		const extensions = vscode.extensions.all;
		assert.notStrictEqual(extensions.findIndex((e) => e.id === EXTENSION_ID), -1);
	});

	test('should server running with charset=UTF-8', async () => {
		await vscode.commands.executeCommand(Commands.start);
		const ret = await axios.get(`http://localhost:${DEFAULT_SERVER_PORT}/utf8.html`);
		assert.strictEqual(ret.headers['content-type'], 'text/html; charset=UTF-8');
	});

	test('should vscode have commands', async () => {
		let commands = await vscode.commands.getCommands(true);
		commands = commands.filter((cmd: string) => cmd.startsWith(COMMAND_PREFIX));
		for (let key in Commands) {
			const cmd = (Commands as any)[key];
			assert.notStrictEqual(commands.indexOf(cmd), -1);
		}
	});
	
	test('should server stopped', async () => {
		await vscode.commands.executeCommand(Commands.stop);
		try {
			await axios.get(`http://localhost:${DEFAULT_SERVER_PORT}`);
		} catch (error) {
			assert.strict(error instanceof Error);
			assert.strictEqual((error as any).code, 'ECONNREFUSED');
		}
	});

	test('should server running with charset=GBK', async () => {
		await vscode.commands.executeCommand(Commands.startGbk);
		const ret = await axios.get(`http://localhost:${DEFAULT_SERVER_PORT}/gbk.html`);
		assert.strictEqual(ret.headers['content-type'], 'text/html; charset=GBK');
	});

	test('should server restart with a random charset', async () => {
		sinon.restore();
		const charsets = [];
		for (let key in Charset) {
			charsets.push((Charset as any)[key]);
		}
		charsets.sort(() => Math.random() - 0.5);

		const charset = charsets.pop();

		sinon.stub(vscode.window, 'showQuickPick').callsFake((): Thenable<vscode.QuickPickItem | undefined> => {
			return charset as any;
		});
		await vscode.commands.executeCommand(Commands.restart);
		const ret = await axios.get(`http://localhost:${DEFAULT_SERVER_PORT}/utf8.html`);
		assert.strictEqual(ret.headers['content-type'], `text/html; charset=${charset}`);
		sinon.restore();
	});

	test('should extension get configuration', () => {
		const port = getConfig(ConfigKeys.port);
		const charset = getConfig(ConfigKeys.charset);

		assert.strictEqual(port , DEFAULT_SERVER_PORT);
		assert.strictEqual(charset , DEFAULT_CHARSET);
	});

});
