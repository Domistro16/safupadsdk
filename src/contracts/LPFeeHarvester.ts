// src/contracts/LPFeeHarvester.ts
import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import {
  LPLockInfo,
  HarvestStats,
  PlatformStats,
  TxResult,
  TxOptions,
  EventFilterOptions,
} from '../types';
import { GAS_LIMITS } from '../constants';

// src/contracts/LPFeeHarvester.ts (updated constructor)
import { LPFeeHarvesterABI } from '../abis';

export class LPFeeHarvester extends BaseContract {
  constructor(address: string, provider: ethers.Provider, signer?: ethers.Signer) {
    super(address, LPFeeHarvesterABI, provider, signer);
  }
  /**
   * Get LP lock information
   */
  async getLockInfo(tokenAddress: string): Promise<LPLockInfo> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getLockInfo(tokenAddress);

    return {
      lpToken: info.lpToken,
      creator: info.creator,
      projectInfoFi: info.projectInfoFi,
      lpAmount: info.lpAmount,
      initialLPAmount: info.initialLPAmount,
      lockTime: info.lockTime,
      unlockTime: info.unlockTime,
      active: info.active,
      totalFeesHarvested: info.totalFeesHarvested,
      harvestCount: info.harvestCount,
      timeUntilUnlock: info.timeUntilUnlock,
      estimatedValue: info.estimatedValue,
      lastHarvestTime: info.lastHarvestTime,
    };
  }

  /**
   * Get harvest history for a token
   */
  async getHarvestHistory(tokenAddress: string): Promise<HarvestStats[]> {
    this.validateAddress(tokenAddress);

    const history = await this.contract.getHarvestHistory(tokenAddress);

    return history.map((h: any) => ({
      bnbAmount: h.bnbAmount,
      token0Amount: h.token0Amount,
      token1Amount: h.token1Amount,
      timestamp: h.timestamp,
      lpBurned: h.lpBurned,
    }));
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const stats = await this.contract.getPlatformStats();

    return {
      totalValueLocked: stats._totalValueLocked,
      totalFeesDistributed: stats._totalFeesDistributed,
      totalHarvests: stats._totalHarvests,
      activeLocksCount: stats._activeLocksCount,
    };
  }

  /**
   * Check if harvesting is available
   */
  async canHarvest(tokenAddress: string): Promise<{ ready: boolean; timeRemaining: bigint }> {
    this.validateAddress(tokenAddress);

    const result = await this.contract.canHarvest(tokenAddress);

    return {
      ready: result.ready,
      timeRemaining: result.timeRemaining,
    };
  }

  /**
   * Harvest fees from LP position
   */
  async harvestFees(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.harvestFees(
      tokenAddress,
      this.buildTxOptions(options, GAS_LIMITS.HARVEST_FEES)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Unlock LP tokens after lock period
   */
  async unlockLP(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.unlockLP(
      tokenAddress,
      this.buildTxOptions(options, GAS_LIMITS.UNLOCK_LP)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Extend lock duration
   */
  async extendLock(
    tokenAddress: string,
    additionalDays: number,
    options?: TxOptions
  ): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const additionalDuration = BigInt(additionalDays * 24 * 60 * 60);

    const tx = await this.contract.extendLock(
      tokenAddress,
      additionalDuration,
      this.buildTxOptions(options)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Get all locked projects
   */
  async getAllLockedProjects(): Promise<string[]> {
    return await this.contract.getAllLockedProjects();
  }

  /**
   * Get active locks count
   */
  async getActiveLocksCount(): Promise<number> {
    const count = await this.contract.getActiveLocksCount();
    return Number(count);
  }

  /**
   * Get LP value for a token
   */
  async getLPValue(tokenAddress: string): Promise<{
    token0Amount: bigint;
    token1Amount: bigint;
    token0: string;
    token1: string;
  }> {
    this.validateAddress(tokenAddress);

    const value = await this.contract.getLPValue(tokenAddress);

    return {
      token0Amount: value.token0Amount,
      token1Amount: value.token1Amount,
      token0: value.token0,
      token1: value.token1,
    };
  }

  /**
   * Check if lock is expired
   */
  async isLockExpired(tokenAddress: string): Promise<boolean> {
    const info = await this.getLockInfo(tokenAddress);
    const currentTime = Math.floor(Date.now() / 1000);
    return Number(info.unlockTime) <= currentTime;
  }

  /**
   * Get time until unlock
   */
  async getTimeUntilUnlock(tokenAddress: string): Promise<number> {
    const info = await this.getLockInfo(tokenAddress);
    return Number(info.timeUntilUnlock);
  }

  /**
   * Get time until next harvest
   */
  async getTimeUntilNextHarvest(tokenAddress: string): Promise<number> {
    const canHarvestInfo = await this.canHarvest(tokenAddress);
    if (canHarvestInfo.ready) {
      return 0;
    }
    return Number(canHarvestInfo.timeRemaining);
  }

  /**
   * Listen to FeesHarvested events
   */
  onFeesHarvested(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('FeesHarvested', callback, filter);
  }

  /**
   * Listen to LPUnlocked events
   */
  onLPUnlocked(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('LPUnlocked', callback, filter);
  }

  /**
   * Listen to LockExtended events
   */
  onLockExtended(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('LockExtended', callback, filter);
  }
}
