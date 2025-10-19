# SafuPad SDK

A comprehensive TypeScript SDK for interacting with SafuPad smart contracts on Binance Smart Chain.

## Features

- 🔐 **Type-safe** - Full TypeScript support with comprehensive types
- 🎯 **Easy to use** - Simple, intuitive API
- ⚡ **Fast** - Optimized for performance
- 🌐 **Multi-network** - Support for BSC Mainnet, Testnet, and localhost
- 🔌 **Flexible** - Works in Node.js and browsers
- 📊 **Complete** - All contract functions wrapped with helpers
- 🎨 **Event handling** - Easy event listening and filtering
- 🛡️ **Error handling** - Comprehensive error types and messages

## Installation

```bash
npm install @safupad/sdk ethers
# or
yarn add @safupad/sdk ethers
# or
pnpm add @safupad/sdk ethers
```

## Quick Start

### Browser (React/Vue/etc)

```typescript
import { SafuPadSDK } from '@safupad/sdk';

// Initialize SDK with MetaMask or other injected provider
const sdk = new SafuPadSDK({
  network: 'bsc',
  provider: window.ethereum,
});

await sdk.initialize();

// Connect wallet
const address = await sdk.connect();
console.log('Connected:', address);

// Buy tokens
const tx = await sdk.bondingDex.buyTokens('0x...', '0.1');
await tx.wait();
```

### Node.js (Backend/Scripts)

```typescript
import { SafuPadSDK } from '@safupad/sdk';

const sdk = new SafuPadSDK({
  network: 'bscTestnet',
  privateKey: process.env.PRIVATE_KEY,
});

await sdk.initialize();

// Create a launch
const tx = await sdk.launchpad.createLaunch({
  name: 'MyToken',
  symbol: 'MTK',
  totalSupply: 1000000000,
  raiseTargetUSD: '50000',
  raiseMaxUSD: '100000',
  vestingDuration: 90,
  metadata: {
    logoURI: 'https://example.com/logo.png',
    description: 'My awesome token',
    website: 'https://mytoken.com',
    twitter: 'https://twitter.com/mytoken',
    telegram: 'https://t.me/mytoken',
    discord: 'https://discord.gg/mytoken',
  },
  projectInfoFiWallet: '0x...',
  burnLP: false,
});

await tx.wait();
```

## Core Concepts

### SDK Instance

The main entry point for all SafuPad interactions:

```typescript
const sdk = new SafuPadSDK({
  network: 'bsc' | 'bscTestnet' | 'localhost',
  provider?: string | Provider | BrowserProvider,
  privateKey?: string,
});

await sdk.initialize();
```

### Contract Modules

The SDK exposes five main contract modules:

- **`sdk.launchpad`** - LaunchpadManager interactions
- **`sdk.bondingDex`** - BondingCurveDEX trading
- **`sdk.tokenFactory`** - Token creation
- **`sdk.priceOracle`** - Price feeds
- **`sdk.lpHarvester`** - LP lock and fee harvesting

## API Reference

### LaunchpadManager

#### Create Project Raise

```typescript
const tx = await sdk.launchpad.createLaunch({
  name: 'MyToken',
  symbol: 'MTK',
  totalSupply: 1000000000, // 1 billion
  raiseTargetUSD: '50000',
  raiseMaxUSD: '100000',
  vestingDuration: 90, // days
  metadata: {...},
  projectInfoFiWallet: '0x...',
  burnLP: false, // or true to burn LP
  vanitySalt: '0x...', // optional
});
```

#### Create Instant Launch

```typescript
const tx = await sdk.launchpad.createInstantLaunch({
  name: 'MemeToken',
  symbol: 'MEME',
  totalSupply: 1000000000, // must be 1 billion
  metadata: {...},
  initialBuyBNB: '0.1',
  burnLP: true,
  vanitySalt: '0x...', // optional
});
```

#### Contribute to Raise

```typescript
const tx = await sdk.launchpad.contribute(
  tokenAddress,
  '0.5' // BNB amount
);
```

#### Get Launch Info

```typescript
const info = await sdk.launchpad.getLaunchInfo(tokenAddress);
console.log('Founder:', info.founder);
console.log('Raised:', sdk.formatBNB(info.totalRaised));
console.log('Target:', sdk.formatBNB(info.raiseTarget));
console.log('Completed:', info.raiseCompleted);
console.log('Graduated:', info.graduatedToPancakeSwap);
```

#### Claim Founder Rewards

```typescript
// Check claimable amounts
const amounts = await sdk.launchpad.getClaimableAmounts(tokenAddress);

// Claim vested tokens
if (amounts.claimableTokens > 0n) {
  const tx = await sdk.launchpad.claimFounderTokens(tokenAddress);
  await tx.wait();
}

// Claim vested BNB
if (amounts.claimableFunds > 0n) {
  const tx = await sdk.launchpad.claimRaisedFunds(tokenAddress);
  await tx.wait();
}
```

#### Graduate to PancakeSwap

```typescript
const tx = await sdk.launchpad.graduateToPancakeSwap(tokenAddress);
await tx.wait();
```

### BondingCurveDEX

#### Buy Tokens

```typescript
// Get quote first
const quote = await sdk.bondingDex.getBuyQuote(tokenAddress, '0.1');
console.log('You will receive:', sdk.formatToken(quote.tokensOut));

// Buy with 1% slippage tolerance
const tx = await sdk.bondingDex.buyTokens(
  tokenAddress,
  '0.1', // BNB amount
  1 // slippage %
);
await tx.wait();
```

#### Sell Tokens

```typescript
// Get quote
const quote = await sdk.bondingDex.getSellQuote(tokenAddress, '1000');
console.log('You will receive:', sdk.formatBNB(quote.tokensOut), 'BNB');

// Sell with 1% slippage
const tx = await sdk.bondingDex.sellTokens(
  tokenAddress,
  '1000', // token amount
  1 // slippage %
);
```

#### Get Pool Info

```typescript
const pool = await sdk.bondingDex.getPoolInfo(tokenAddress);
console.log('Market Cap:', sdk.formatBNB(pool.marketCapUSD), 'USD');
console.log('BNB Reserve:', sdk.formatBNB(pool.bnbReserve));
console.log('Token Reserve:', sdk.formatToken(pool.tokenReserve));
console.log('Current Price:', sdk.formatBNB(pool.currentPrice));
console.log('Graduation:', Number(pool.graduationProgress), '%');
console.log('Graduated:', pool.graduated);
```

#### Get Fee Information

```typescript
const feeInfo = await sdk.bondingDex.getFeeInfo(tokenAddress);
console.log('Current fee:', Number(feeInfo.currentFeeRate) / 100, '%');
console.log('Fee stage:', feeInfo.feeStage);
console.log('Blocks until next tier:', feeInfo.blocksUntilNextTier);
```

#### Claim Creator Fees

```typescript
const feeInfo = await sdk.bondingDex.getCreatorFeeInfo(tokenAddress);

if (feeInfo.canClaim) {
  const tx = await sdk.bondingDex.claimCreatorFees(tokenAddress);
  await tx.wait();
}
```

#### Post-Graduation Stats

```typescript
const stats = await sdk.bondingDex.getPostGraduationStats(tokenAddress);
console.log('Tokens sold:', sdk.formatToken(stats.totalTokensSold));
console.log('Liquidity added:', sdk.formatBNB(stats.totalLiquidityAdded));
console.log('LP generated:', stats.lpTokensGenerated);
```

### Price Oracle

```typescript
// Get current BNB price in USD
const price = await sdk.priceOracle.getBNBPrice();
console.log('BNB Price:', sdk.formatUnits(price, 8), 'USD');

// Convert USD to BNB
const bnbAmount = await sdk.priceOracle.usdToBNB(
  ethers.parseUnits('50000', 18)
);

// Convert BNB to USD
const usdAmount = await sdk.priceOracle.bnbToUSD(
  ethers.parseEther('10')
);
```

### Utility Functions

```typescript
// Format amounts
const bnb = sdk.formatBNB(bigintAmount); // "0.5"
const tokens = sdk.formatToken(bigintAmount, 18); // "1000.0"

// Parse amounts
const bnbWei = sdk.parseBNB('0.5'); // bigint
const tokenWei = sdk.parseToken('1000', 18); // bigint

// Get balance
const balance = await sdk.getBalance(); // current signer
const otherBalance = await sdk.getBalance('0x...'); // other address

// Get gas price
const gasPrice = await sdk.getGasPrice(); // in gwei

// Get explorer URL
const url = sdk.getExplorerUrl('address', '0x...');
const txUrl = sdk.getExplorerUrl('tx', '0x...');
```

## Event Handling

### Listen to Events

```typescript
// Launch events
const unsubscribe1 = sdk.launchpad.onLaunchCreated((event) => {
  console.log('New launch:', event.args.token);
});

// Trading events
const unsubscribe2 = sdk.bondingDex.onTokensBought((event) => {
  console.log('Buyer:', event.args.buyer);
  console.log('Amount:', sdk.formatBNB(event.args.bnbAmount));
});

// Graduation events
const unsubscribe3 = sdk.bondingDex.onPoolGraduated((event) => {
  console.log('Pool graduated:', event.args.token);
});

// Cleanup
unsubscribe1();
unsubscribe2();
unsubscribe3();
```

### Query Past Events

```typescript
const events = await sdk.launchpad.getPastEvents('LaunchCreated', {
  fromBlock: 0,
  toBlock: 'latest',
});

events.forEach((event) => {
  console.log('Token:', event.args.token);
  console.log('Founder:', event.args.founder);
});
```

## Error Handling

```typescript
import { SafuPadError, ContractError, ValidationError } from '@safupad/sdk';

try {
  const tx = await sdk.bondingDex.buyTokens(tokenAddress, '0.1');
  await tx.wait();
} catch (error) {
  if (error instanceof ContractError) {
    console.error('Contract error:', error.message);
    console.error('Code:', error.code);
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message);
  } else if (error instanceof SafuPadError) {
    console.error('SafuPad error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
}
```

## Advanced Usage

### Custom Network Configuration

```typescript
const sdk = new SafuPadSDK({
  network: {
    name: 'Custom Network',
    chainId: 56,
    rpcUrl: 'https://custom-rpc.com',
    explorerUrl: 'https://custom-explorer.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    contracts: {
      launchpadManager: '0x...',
      bondingCurveDEX: '0x...',
      tokenFactory: '0x...',
      priceOracle: '0x...',
      lpFeeHarvester: '0x...',
      pancakeRouter: '0x...',
      pancakeFactory: '0x...',
    },
  },
});
```

### Using Different Signers

```typescript
// Create SDK with default signer
const sdk = new SafuPadSDK({...});

// Switch to different signer
const newWallet = new ethers.Wallet(privateKey, provider);
sdk.updateSigner(newWallet);

// Or create new SDK instance with different signer
const newSdk = sdk.withSigner(newWallet);
```

### Estimate Gas

```typescript
// For launchpad operations
const gasLimit = await sdk.launchpad.estimateGas(
  'createLaunch',
  [...args],
  txOptions
);

// Manual gas estimation
const tx = await sdk.launchpad.createLaunch({...});
const gasEstimate = await sdk.estimateGas(tx);
```

## React Integration

```tsx
import { SafuPadSDK } from '@safupad/sdk';
import { useState, useEffect } from 'react';

function useSafuPad() {
  const [sdk, setSdk] = useState<SafuPadSDK | null>(null);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const initSDK = async () => {
      const newSdk = new SafuPadSDK({
        network: 'bsc',
        provider: window.ethereum,
      });
      
      await newSdk.initialize();
      setSdk(newSdk);
    };

    initSDK();
  }, []);

  const connect = async () => {
    if (sdk) {
      const addr = await sdk.connect();
      setAddress(addr);
      return addr;
    }
  };

  return { sdk, address, connect };
}

function App() {
  const { sdk, address, connect } = useSafuPad();

  const handleBuy = async () => {
    if (!sdk) return;
    
    const tx = await sdk.bondingDex.buyTokens('0x...', '0.1');
    await tx.wait();
    alert('Purchase successful!');
  };

  return (
    <div>
      {!address ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected: {address}</p>
          <button onClick={handleBuy}>Buy Tokens</button>
        </div>
      )}
    </div>
  );
}
```

## Testing

```typescript
import { SafuPadSDK } from '@safupad/sdk';

// Use localhost network for testing
const sdk = new SafuPadSDK({
  network: 'localhost',
  provider: 'http://localhost:8545',
  privateKey: 'test_private_key',
});
```

## Building from Source

```bash
# Clone repository
git clone https://github.com/safupad/sdk.git
cd sdk

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Generate documentation
npm run docs
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@safupad.com
- 💬 Discord: https://discord.gg/safupad
- 🐦 Twitter: https://twitter.com/safupad
- 📖 Docs: https://docs.safupad.com

## Changelog

### v1.0.0
- Initial release
- Full support for all SafuPad contracts
- TypeScript support
- Event handling
- Comprehensive documentation
- Browser and Node.js support