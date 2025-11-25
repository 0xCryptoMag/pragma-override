import type { SolidityHooks } from 'hardhat/types/hooks';
import type { PragmaOverride } from '../config.js';
import semver from 'semver';
import { Minimatch } from 'minimatch';

export default async (): Promise<Partial<SolidityHooks>> => {
	const handlers: Partial<SolidityHooks> = {
		async onCleanUpArtifacts(context, artifactPaths, next) {
			return await next(context, artifactPaths);
		},

		async preprocessProjectFileBeforeBuilding(
			context,
			inputSourceName,
			fsPath,
			fileContent,
			solcVersion,
			next
		) {
			return await next(
				context,
				inputSourceName,
				fsPath,
				fileContent,
				solcVersion
			);
		},

		async preprocessSolcInputBeforeBuilding(context, solcInput, next) {
			return await next(context, solcInput);
		},

		async readSourceFile(context, absolutePath, next) {
			const fileContent = await next(context, absolutePath);
			const pragmaOverride = context.config.pragmaOverride;

			if (!pragmaOverride) return fileContent;

			const lines = fileContent.split('\n');
			const processedLines: string[] = [];

			for (const line of lines) {
				if (!line.includes('pragma solidity')) {
					processedLines.push(line);
					continue;
				}

				const declaredPragma = line
					.split('pragma solidity')[1]
					?.trim()
					.replace(/;.*$/, '') // Remove semicolon and any trailing comments
					.trim();
				if (!declaredPragma) {
					processedLines.push(line);
					continue;
				}

				let matchedOverride: PragmaOverride[number] | null = null;

				for (const override of pragmaOverride) {
					let overridePass = false;

					if ('pathGlobs' in override) {
						if (globTest(absolutePath, override)) {
							overridePass = true;
						}
					} else {
						if (stalePragmaTest(declaredPragma, override)) {
							overridePass = true;
						}
					}

					if (overridePass) {
						matchedOverride = override;
						break;
					}
				}

				if (matchedOverride) {
					processedLines.push(
						`pragma solidity ${matchedOverride.override};`
					);
				} else {
					processedLines.push(line);
				}
			}

			return processedLines.join('\n');
		}
	};

	return handlers;
};

function globTest(
	inputFilePath: string,
	pragmaOverride: Extract<PragmaOverride[number], { pathGlobs: string[] }>
): boolean {
	return (
		pragmaOverride.pathGlobs?.some((glob) =>
			new Minimatch(glob).match(inputFilePath)
		) ?? false
	);
}

function stalePragmaTest(
	declaredPragma: string,
	pragmaOverride: Extract<PragmaOverride[number], { stalePragmas: string[] }>
): boolean {
	return pragmaOverride.stalePragmas.some((stalePragma) =>
		semver.intersects(stalePragma, declaredPragma)
	);
}
