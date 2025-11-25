import { HardhatUserConfig } from 'hardhat/config';
import { HardhatConfig } from 'hardhat/types/config';
import { HardhatUserConfigValidationError } from 'hardhat/types/hooks';
import semver from 'semver';
import { z } from 'zod/v4';

const pragmaOverrideSchema = z.array(
	z
		.object({
			override: z
				.string()
				.refine(semver.valid, 'override must be a valid semver version')
		})
		.and(
			z
				.object({
					pathGlobs: z.array(z.string()).default([])
				})
				.or(
					z.object({
						stalePragmas: z
							.array(z.string().refine(semver.valid))
							.default([])
					})
				)
		)
);
export type PragmaOverride = z.infer<typeof pragmaOverrideSchema>;

export async function validatePluginConfig(
	userConfig: HardhatUserConfig
): Promise<HardhatUserConfigValidationError[]> {
	if (userConfig.pragmaOverride === undefined) return [];

	const parseResult = pragmaOverrideSchema.safeParse(
		userConfig.pragmaOverride
	);

	if (!parseResult.success) {
		return parseResult.error.issues.map((issue) => ({
			path: ['pragmaOverride'],
			message: issue.message
		}));
	}

	return [];
}

export async function resolvePluginConfig(
	userConfig: HardhatUserConfig,
	partiallyResolvedConfig: HardhatConfig
): Promise<HardhatConfig> {
	return {
		...partiallyResolvedConfig,
		pragmaOverride: userConfig.pragmaOverride
	};
}
