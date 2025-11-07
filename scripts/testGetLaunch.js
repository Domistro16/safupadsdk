
// const LaunchpadManagerABI = [
//   // Create functions
//   'function createLaunch(string,string,uint256,uint256,uint256,uint256,tuple(string,string,string,string,string,string),address,bool) returns (address)',
//   'function createLaunchWithVanity(string,string,uint256,uint256,uint256,uint256,tuple(string,string,string,string,string,string),bytes32,address,bool) returns (address)',
//   'function createInstantLaunch(string,string,uint256,tuple(string,string,string,string,string,string),uint256,bool) payable returns (address)',
//   'function createInstantLaunchWithVanity(string,string,uint256,tuple(string,string,string,string,string,string),uint256,bytes32,bool) payable returns (address)',

//   // Core functions
//   'function contribute(address) payable',
//   'function claimFounderTokens(address)',
//   'function claimRaisedFunds(address)',
//   'function graduateToPancakeSwap(address)',

//   // View functions
//   'function getLaunchInfo(address) view returns (address,uint256,uint256,uint256,uint256,bool,bool,uint256,uint256,uint8,address,bool)',
//   'function getLaunchInfoWithUSD(address) view returns (address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,uint8,bool)',
//   'function getClaimableAmounts(address) view returns (uint256,uint256)',
//   'function getContribution(address,address) view returns (uint256,bool)',
//   'function getAllLaunches() view returns (address[])',

//   // Events
//   'event LaunchCreated(address indexed,address indexed,uint256,uint8,uint256,uint256,uint256,bool,address indexed,bool)',
//   'event InstantLaunchCreated(address indexed,address indexed,uint256,uint256,uint256,bool)',
//   'event ContributionMade(address indexed,address indexed,uint256)',
//   'event RaiseCompleted(address indexed,uint256)',
//   'event GraduatedToPancakeSwap(address indexed,uint256,uint256)',
// ];

// const provider = new JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
// const launch = new ethers.Contract(
//   '0x79a7bec1aF5616E1813a53aEabA61c99794Fb09B',
//   LaunchpadManagerABI,
//   provider
// );

// const info = await launch.getLaunchInfoWithUSD('0x172608F200E522e5ADBD666BB5A591cff18ac20c');

// console.log(info);

import { SafuPadSDK } from '../dist/SafuPadSDK.js';

// Initialize SDK with MetaMask or other injected provider
const sdk = new SafuPadSDK({
  network: 'bscTestnet',
  privateKey: '0xc7e111c598dcad781a39ca239fabba23aae63368f750f23cb79648a4a0218e36',
});

await sdk.initialize();

const info = sdk.launchpad.getLaunchInfoWithUSD('0x172608F200E522e5ADBD666BB5A591cff18ac20c');

console.log(info);
