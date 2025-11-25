# pragma-override

Hardhat plugin to change the pragma of a contract pre-compilation. Useful when importing contracts with incompatible pragmas. Should be used when simply calling functions on a contract, and should be avoided/used with caution if importing for inheritance.

## Installation

```bash
npm install --save-dev pragma-override
# or
pnpm add -D pragma-override
# or
yarn add -D pragma-override
```

## Usage

### 1. Add the plugin to your `hardhat.config.ts`

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import pragmaOverride from 'pragma-override';

const config: HardhatUserConfig = {
	plugins: [pragmaOverride]
	// ... rest of config
};

export default config;
```

### 2. Configure pragma overrides

Add a `pragmaOverride` array to your Hardhat config. Each entry specifies:

-   `override`: The Solidity version to use instead (must be a valid semver version)
-   Either `pathGlobs` or `stalePragmas`:
    -   `pathGlobs`: Array of glob patterns matching file paths to override
    -   `stalePragmas`: Array of semver ranges. Any pragma that intersects with these ranges will be overridden

### Example: Override by file path

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import pragmaOverride from 'pragma-override';

const config: HardhatUserConfig = {
	plugins: [pragmaOverride],
	pragmaOverride: [
		{
			override: '0.8.20',
			pathGlobs: ['contracts/vendor/**/*.sol']
		}
	]
};

export default config;
```

### Example: Override by pragma version

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import pragmaOverride from 'pragma-override';

const config: HardhatUserConfig = {
	plugins: [pragmaOverride],
	pragmaOverride: [
		{
			override: '0.8.20',
			stalePragmas: ['<=0.7.6'] // Override any pragma <= 0.7.6
		}
	]
};

export default config;
```

### Example: Multiple overrides

```typescript
import { HardhatUserConfig } from 'hardhat/config';
import pragmaOverride from 'pragma-override';

const config: HardhatUserConfig = {
	plugins: [pragmaOverride],
	pragmaOverride: [
		{
			override: '0.8.20',
			pathGlobs: ['contracts/vendor/old-contract.sol']
		},
		{
			override: '0.8.19',
			stalePragmas: ['^0.7.0', '0.6.12']
		}
	]
};

export default config;
```

## How It Works

The plugin uses Hardhat's `readSourceFile` hook to intercept file reads during compilation. When a Solidity file is read:

1. If the file matches a `pathGlobs` pattern, its pragma is replaced with the `override` version
2. If the file's pragma intersects with any `stalePragmas` range, it's replaced with the `override` version
3. The modified file content is then passed to the compiler

The override happens automatically during normal compilation (`npx hardhat compile` or `npx hardhat build`). No special commands are needed.

## Use Cases

✅ **Good for:**

-   Importing contracts from external libraries with incompatible pragmas
-   Calling functions on contracts (via interfaces or external calls)
-   Upgrading legacy contracts that can't be modified

⚠️ **Use with caution:**

-   Contracts imported for inheritance (may cause unexpected behavior)
-   Contracts that rely on specific compiler versions for gas optimization
-   Production deployments where pragma changes could affect bytecode

## Configuration Schema

```typescript
pragmaOverride?: Array<{
  override: string; // Valid semver version (e.g., "0.8.20")
  pathGlobs?: string[]; // Glob patterns (e.g., ["contracts/vendor/**/*.sol"])
  stalePragmas?: string[]; // Semver ranges (e.g., ["<=0.7.6", "^0.7.0"])
}>
```

## Examples

### Override all contracts in a vendor directory

```typescript
pragmaOverride: [
	{
		override: '0.8.20',
		pathGlobs: ['contracts/vendor/**/*.sol']
	}
];
```

### Override all contracts with old pragmas

```typescript
pragmaOverride: [
	{
		override: '0.8.20',
		stalePragmas: ['<=0.7.6', '<0.8.0']
	}
];
```

### Override specific files with specific versions

```typescript
pragmaOverride: [
	{
		override: '0.8.20',
		pathGlobs: ['contracts/vendor/ContractA.sol']
	},
	{
		override: '0.8.19',
		pathGlobs: ['contracts/vendor/ContractB.sol']
	}
];
```

## Requirements

-   Hardhat ^3.0.15
-   Node.js (see Hardhat requirements)

## License

ISC

## Author

0xCryptoMag
