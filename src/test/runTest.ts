import { downloadAndUnzipVSCode, runTests } from '@vscode/test-electron';
import * as path from 'path';

async function main() {
	try {
		// https://az764295.vo.msecnd.net/insider/c6e58d126f6b5676242e32b34180b2a595f29b51/VSCode-darwin.zip
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// https://az764295.vo.msecnd.net/insider/c6e58d126f6b5676242e32b34180b2a595f29b51/VSCode-darwin.zip
		const vscodeExecutablePath = await downloadAndUnzipVSCode('1.63.2');
		// const cliPath = resolveCliPathFromVSCodeExecutablePath(vscodeExecutablePath);

    // // Use cp.spawn / cp.exec for custom setup
    // cp.spawnSync(cliPath, ['--install-extension', '<EXTENSION-ID-OR-PATH-TO-VSIX>'], {
    //   encoding: 'utf-8',
    //   stdio: 'inherit'
    // });

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index');

		const testWorkspace = path.resolve(__dirname, '../../public');

		// Download VS Code, unzip it and run the integration test
		// await runTests({ extensionDevelopmentPath, extensionTestsPath, launchArgs: [testWorkspace] });
		await runTests({ reuseMachineInstall: false, extensionDevelopmentPath, extensionTestsPath, vscodeExecutablePath, launchArgs: [testWorkspace] });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
