import type { HardhatPlugin } from 'hardhat/types/plugins';
import './type-extensions.js';

const pragmaOverridePlugin: HardhatPlugin = {
	id: 'pragma-override',
	hookHandlers: {
		config: () => import('./hooks/config.js'),
		solidity: () => import('./hooks/solidity.js')
	},
	npmPackage: 'pragma-override'
};

export default pragmaOverridePlugin;
