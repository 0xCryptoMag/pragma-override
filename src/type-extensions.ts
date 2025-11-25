import { PragmaOverride } from './config.js';
import 'hardhat/types/config';

declare module 'hardhat/types/config' {
	interface HardhatUserConfig {
		pragmaOverride?: PragmaOverride;
	}

	interface HardhatConfig {
		pragmaOverride: PragmaOverride;
	}
}
