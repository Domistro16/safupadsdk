// src/abis/index.ts

/**
 * Contract ABIs
 *
 * These are minimal ABIs containing only the functions used by the SDK.
 * For full ABIs, import from your compiled contracts.
 */

export const LaunchpadManagerABI = [
  // Create functions
  'function createLaunch(string,string,uint256,uint256,uint256,uint256,tuple(string,string,string,string,string,string),address,bool) returns (address)',
  'function createLaunchWithVanity(string,string,uint256,uint256,uint256,uint256,tuple(string,string,string,string,string,string),bytes32,address,bool) returns (address)',
  'function createInstantLaunch(string,string,uint256,tuple(string,string,string,string,string,string),uint256,bool) payable returns (address)',
  'function createInstantLaunchWithVanity(string,string,uint256,tuple(string,string,string,string,string,string),uint256,bytes32,bool) payable returns (address)',

  // Core functions
  'function contribute(address) payable',
  'function claimFounderTokens(address)',
  'function claimRaisedFunds(address)',
  'function graduateToPancakeSwap(address)',

  // View functions
  'function getLaunchInfo(address) view returns (address,uint256,uint256,uint256,uint256,bool,bool,uint256,uint256,uint8,address,bool)',
  'function getLaunchInfoWithUSD(address) view returns (address,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool,uint8,bool)',
  'function getClaimableAmounts(address) view returns (uint256,uint256)',
  'function getContribution(address,address) view returns (uint256,bool)',
  'function getAllLaunches() view returns (address[])',

  // Events
  'event LaunchCreated(address indexed,address indexed,uint256,uint8,uint256,uint256,uint256,bool,address indexed,bool)',
  'event InstantLaunchCreated(address indexed,address indexed,uint256,uint256,uint256,bool)',
  'event ContributionMade(address indexed,address indexed,uint256)',
  'event RaiseCompleted(address indexed,uint256)',
  'event GraduatedToPancakeSwap(address indexed,uint256,uint256)',
];

export const BondingCurveDEXABI = [
  // Trading functions
  'function buyTokens(address,uint256) payable',
  'function sellTokens(address,uint256,uint256)',

  // View functions
  'function getBuyQuote(address,uint256) view returns (uint256,uint256)',
  'function getSellQuote(address,uint256) view returns (uint256,uint256)',
  'function getPoolInfo(address) view returns (uint256,uint256,uint256,uint256,uint256,uint256,uint256,uint256,bool)',
  'function getCurrentFeeRate(address) view returns (uint256)',
  'function getFeeInfo(address) view returns (uint256,uint256,uint256,uint256,string)',
  'function getCreatorFeeInfo(address) view returns (uint256,uint256,uint256,uint256,uint256,bool)',
  'function getPostGraduationStats(address) view returns (uint256,uint256,uint256)',
  'function getActiveTokens() view returns (address[])',

  // Claim functions
  'function claimCreatorFees(address)',

  // Events
  'event TokensBought(address indexed,address indexed,uint256,uint256,uint256,uint256)',
  'event TokensSold(address indexed,address indexed,uint256,uint256,uint256,uint256)',
  'event PoolGraduated(address indexed,uint256,uint256,uint256,uint256)',
  'event CreatorFeesClaimed(address indexed,address indexed,uint256)',
  'event PostGraduationSell(address indexed,address indexed,uint256,uint256,uint256,uint256)',
];

export const TokenFactoryABI = [
  'function getTotalTokens() view returns (uint256)',
  'function getTokenAtIndex(uint256) view returns (address)',
  'function getCreatorTokens(address) view returns (address[])',
  'function computeAddress(string,string,uint256,uint8,address,tuple(string,string,string,string,string,string),bytes32) view returns (address)',
];

export const PriceOracleABI = [
  'function getBNBPrice() view returns (uint256)',
  'function usdToBNB(uint256) view returns (uint256)',
  'function bnbToUSD(uint256) view returns (uint256)',
  'function priceFeed() view returns (address)',
];

export const LPFeeHarvesterABI = [
  'function getLockInfo(address) view returns (address,address,address,uint256,uint256,uint256,uint256,bool,uint256,uint256,uint256,uint256,uint256)',
  'function getHarvestHistory(address) view returns (tuple(uint256,uint256,uint256,uint256,uint256)[])',
  'function getPlatformStats() view returns (uint256,uint256,uint256,uint256)',
  'function canHarvest(address) view returns (bool,uint256)',
  'function harvestFees(address)',
  'function unlockLP(address)',
  'function extendLock(address,uint256)',
  'function getAllLockedProjects() view returns (address[])',
  'function getActiveLocksCount() view returns (uint256)',
  'function getLPValue(address) view returns (uint256,uint256,address,address)',

  'event FeesHarvested(address indexed,uint256,uint256,uint256,uint256,uint256)',
  'event LPUnlocked(address indexed,address indexed,uint256,uint256)',
  'event LockExtended(address indexed,uint256,uint256)',
];

