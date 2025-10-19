// src/index.ts

/**
 * SafuPad SDK
 * 
 * A comprehensive TypeScript SDK for interacting with SafuPad smart contracts
 * 
 * @packageDocumentation
 */

// Main SDK export
export { SafuPadSDK } from './SafuPadSDK';
export { default } from './SafuPadSDK';

// Contract classes
export { BaseContract } from './contracts/BaseContract';
export { LaunchpadManager } from './contracts/LaunchpadManager';
export { BondingCurveDEX } from './contracts/BondingCurveDEX';
export { TokenFactory } from './contracts/TokenFactory';
export { PriceOracle } from './contracts/PriceOracle';
export { LPFeeHarvester } from './contracts/LPFeeHarvester';

// Types
export type {
  NetworkName,
  NetworkConfig,
  SDKConfig,
  TokenMetadata,
  CreateLaunchParams,
  CreateInstantLaunchParams,
  LaunchInfo,
  LaunchInfoWithUSD,
  PoolInfo,
  FeeInfo,
  Quote,
  PostGraduationStats,
  CreatorFeeInfo,
  LPLockInfo,
  HarvestStats,
  PlatformStats,
  TxOptions,
  EventFilterOptions,
  FormattedLaunchInfo,
  FormattedPoolInfo,
  TokenInfo,
  ContributionInfo,
  ClaimableAmounts,
  TxResult,
} from './types';

// Enums
export { LaunchType } from './types';

// Error classes
export {
  SafuPadError,
  NetworkError,
  ContractError,
  ValidationError,
} from './types';

// Constants
export {
  NETWORKS,
  DEFAULT_CONFIG,
  CONSTANTS,
  ERROR_MESSAGES,
  EVENTS,
  UTILS,
  TIME,
  BLOCK_TIME,
  GAS_LIMITS,
} from './constants';

// Utilities
export * from './utils';

// Update SafuPadSDK.ts to use the constructors correctly
// The constructors are already correctly set up, just make sure
// they match what we have above

// Export ABIs from index
export * from './abis';


// Version
export const VERSION = '1.0.0';