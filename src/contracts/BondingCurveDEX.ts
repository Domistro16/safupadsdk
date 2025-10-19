// src/contracts/BondingCurveDEX.ts
import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import {
  PoolInfo,
  FeeInfo,
  Quote,
  CreatorFeeInfo,
  PostGraduationStats,
  TxResult,
  TxOptions,
  EventFilterOptions,
} from '../types';
import { GAS_LIMITS } from '../constants';
// src/contracts/BondingCurveDEX.ts (updated constructor)
import { BondingCurveDEXABI } from '../abis';

/**
 * BondingCurveDEX contract wrapper
 */

export class BondingCurveDEX extends BaseContract {
  constructor(address: string, provider: ethers.Provider, signer?: ethers.Signer) {
    super(address, BondingCurveDEXABI, provider, signer);
  }
  /**
   * Buy tokens from bonding curve
   */
  async buyTokens(
    tokenAddress: string,
    bnbAmount: string,
    slippageTolerance: number = 1, // 1% default
    options?: TxOptions
  ): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const amount = ethers.parseEther(bnbAmount);

    // Get quote
    const quote = await this.getBuyQuote(tokenAddress, bnbAmount);

    // Calculate min tokens with slippage
    const minTokensOut = (quote.tokensOut * BigInt(100 - slippageTolerance)) / 100n;

    // Build transaction
    const txOptions = this.buildTxOptions(options, GAS_LIMITS.BUY_TOKENS);
    txOptions.value = amount;

    const tx = await this.contract.buyTokens(tokenAddress, minTokensOut, txOptions);

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Sell tokens to bonding curve
   */
  async sellTokens(
    tokenAddress: string,
    tokenAmount: string,
    slippageTolerance: number = 1, // 1% default
    options?: TxOptions
  ): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const amount = ethers.parseEther(tokenAmount);

    // Get quote
    const quote = await this.getSellQuote(tokenAddress, tokenAmount);

    // Calculate min BNB with slippage
    const minBNBOut = (quote.tokensOut * BigInt(100 - slippageTolerance)) / 100n;

    const tx = await this.contract.sellTokens(
      tokenAddress,
      amount,
      minBNBOut,
      this.buildTxOptions(options, GAS_LIMITS.SELL_TOKENS)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Get buy quote (how many tokens for X BNB)
   */
  async getBuyQuote(tokenAddress: string, bnbAmount: string): Promise<Quote> {
    this.validateAddress(tokenAddress);

    const amount = ethers.parseEther(bnbAmount);
    const quote = await this.contract.getBuyQuote(tokenAddress, amount);

    return {
      tokensOut: quote.tokensOut,
      pricePerToken: quote.pricePerToken,
    };
  }

  /**
   * Get sell quote (how much BNB for X tokens)
   */
  async getSellQuote(tokenAddress: string, tokenAmount: string): Promise<Quote> {
    this.validateAddress(tokenAddress);

    const amount = ethers.parseEther(tokenAmount);
    const quote = await this.contract.getSellQuote(tokenAddress, amount);

    return {
      tokensOut: quote.bnbOut,
      pricePerToken: quote.pricePerToken,
    };
  }

  /**
   * Get pool information
   */
  async getPoolInfo(tokenAddress: string): Promise<PoolInfo> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getPoolInfo(tokenAddress);

    return {
      marketCapBNB: info.marketCapBNB,
      marketCapUSD: info.marketCapUSD,
      bnbReserve: info.bnbReserve,
      tokenReserve: info.tokenReserve,
      reservedTokens: info.reservedTokens,
      currentPrice: info.currentPrice,
      priceMultiplier: info.priceMultiplier,
      graduationProgress: info.graduationProgress,
      graduated: info.graduated,
    };
  }

  /**
   * Get current fee rate for a token
   */
  async getCurrentFeeRate(tokenAddress: string): Promise<bigint> {
    this.validateAddress(tokenAddress);
    return await this.contract.getCurrentFeeRate(tokenAddress);
  }

  /**
   * Get detailed fee information
   */
  async getFeeInfo(tokenAddress: string): Promise<FeeInfo> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getFeeInfo(tokenAddress);

    return {
      currentFeeRate: info.currentFeeRate,
      finalFeeRate: info.finalFeeRate,
      blocksSinceLaunch: info.blocksSinceLaunch,
      blocksUntilNextTier: info.blocksUntilNextTier,
      feeStage: info.feeStage,
    };
  }

  /**
   * Get creator fee information
   */
  async getCreatorFeeInfo(tokenAddress: string): Promise<CreatorFeeInfo> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getCreatorFeeInfo(tokenAddress);

    return {
      accumulatedFees: info.accumulatedFees,
      lastClaimTime: info.lastClaimTime,
      graduationMarketCap: info.graduationMarketCap,
      currentMarketCap: info.currentMarketCap,
      bnbInPool: info.bnbInPool,
      canClaim: info.canClaim,
    };
  }

  /**
   * Claim creator fees
   */
  async claimCreatorFees(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.claimCreatorFees(tokenAddress, this.buildTxOptions(options));

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Get post-graduation statistics
   */
  async getPostGraduationStats(tokenAddress: string): Promise<PostGraduationStats> {
    this.validateAddress(tokenAddress);

    const stats = await this.contract.getPostGraduationStats(tokenAddress);

    return {
      totalTokensSold: stats.totalTokensSold,
      totalLiquidityAdded: stats.totalLiquidityAdded,
      lpTokensGenerated: stats.lpTokensGenerated,
    };
  }

  /**
   * Get all active tokens
   */
  async getActiveTokens(): Promise<string[]> {
    return await this.contract.getActiveTokens();
  }

  /**
   * Check if pool is graduated
   */
  async isGraduated(tokenAddress: string): Promise<boolean> {
    const info = await this.getPoolInfo(tokenAddress);
    return info.graduated;
  }

  /**
   * Calculate price impact for buy
   */
  async calculateBuyPriceImpact(tokenAddress: string, bnbAmount: string): Promise<number> {
    const poolInfo = await this.getPoolInfo(tokenAddress);
    const quote = await this.getBuyQuote(tokenAddress, bnbAmount);

    if (poolInfo.currentPrice === 0n || quote.tokensOut === 0n) {
      return 0;
    }

    const avgPrice = (ethers.parseEther(bnbAmount) * 10n ** 18n) / quote.tokensOut;
    const priceImpact =
      Number(((avgPrice - poolInfo.currentPrice) * 10000n) / poolInfo.currentPrice) / 100;

    return priceImpact;
  }

  /**
   * Calculate price impact for sell
   */
  async calculateSellPriceImpact(tokenAddress: string, tokenAmount: string): Promise<number> {
    const poolInfo = await this.getPoolInfo(tokenAddress);
    const quote = await this.getSellQuote(tokenAddress, tokenAmount);

    if (poolInfo.currentPrice === 0n || quote.tokensOut === 0n) {
      return 0;
    }

    const avgPrice = (quote.tokensOut * 10n ** 18n) / ethers.parseEther(tokenAmount);
    const priceImpact =
      Number(((poolInfo.currentPrice - avgPrice) * 10000n) / poolInfo.currentPrice) / 100;

    return priceImpact;
  }

  /**
   * Estimate time until fee tier changes
   */
  async estimateTimeUntilFeeTierChange(tokenAddress: string): Promise<number> {
    const feeInfo = await this.getFeeInfo(tokenAddress);

    if (feeInfo.blocksUntilNextTier === 0n) {
      return 0;
    }

    // Assume 3 second block time for BSC
    const secondsRemaining = Number(feeInfo.blocksUntilNextTier) * 3;
    return secondsRemaining;
  }

  /**
   * Get formatted fee percentage
   */
  async getCurrentFeePercentage(tokenAddress: string): Promise<string> {
    const feeRate = await this.getCurrentFeeRate(tokenAddress);
    return `${Number(feeRate) / 100}%`;
  }

  /**
   * Listen to TokensBought events
   */
  onTokensBought(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('TokensBought', callback, filter);
  }

  /**
   * Listen to TokensSold events
   */
  onTokensSold(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('TokensSold', callback, filter);
  }

  /**
   * Listen to PoolGraduated events
   */
  onPoolGraduated(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('PoolGraduated', callback, filter);
  }

  /**
   * Listen to PostGraduationSell events
   */
  onPostGraduationSell(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('PostGraduationSell', callback, filter);
  }

  /**
   * Listen to CreatorFeesClaimed events
   */
  onCreatorFeesClaimed(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('CreatorFeesClaimed', callback, filter);
  }
}
