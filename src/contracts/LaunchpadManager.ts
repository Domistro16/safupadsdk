// src/contracts/LaunchpadManager.ts
import { ethers } from 'ethers';
import { BaseContract } from './BaseContract';
import {
  CreateLaunchParams,
  CreateInstantLaunchParams,
  LaunchInfo,
  LaunchInfoWithUSD,
  ClaimableAmounts,
  ContributionInfo,
  TxResult,
  TxOptions,
  EventFilterOptions,
} from '../types';
import { CONSTANTS, GAS_LIMITS } from '../constants';

/**
 * LaunchpadManager contract wrapper
 */
import { LaunchpadManagerABI } from '../abis';

export class LaunchpadManager extends BaseContract {
  constructor(address: string, provider: ethers.Provider, signer?: ethers.Signer) {
    super(address, LaunchpadManagerABI, provider, signer);
  }
  /**
   * Create a new PROJECT_RAISE launch
   */
  async createLaunch(params: CreateLaunchParams, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();

    // Validate params
    this.validateLaunchParams(params);

    // Convert USD amounts to proper format
    const raiseTargetUSD = ethers.parseUnits(params.raiseTargetUSD, 18);
    const raiseMaxUSD = ethers.parseUnits(params.raiseMaxUSD, 18);
    const vestingDuration = params.vestingDuration * 24 * 60 * 60; // days to seconds

    // Prepare metadata
    const metadata = [
      params.metadata.logoURI,
      params.metadata.description,
      params.metadata.website,
      params.metadata.twitter,
      params.metadata.telegram,
      params.metadata.discord,
    ];

    // Call appropriate function based on whether vanity salt is provided
    let tx: ethers.ContractTransactionResponse;

    if (params.vanitySalt) {
      tx = await this.contract.createLaunchWithVanity(
        params.name,
        params.symbol,
        params.totalSupply,
        raiseTargetUSD,
        raiseMaxUSD,
        vestingDuration,
        metadata,
        params.vanitySalt,
        params.projectInfoFiWallet,
        params.burnLP,
        this.buildTxOptions(options, GAS_LIMITS.CREATE_LAUNCH)
      );
    } else {
      tx = await this.contract.createLaunch(
        params.name,
        params.symbol,
        params.totalSupply,
        raiseTargetUSD,
        raiseMaxUSD,
        vestingDuration,
        metadata,
        params.projectInfoFiWallet,
        params.burnLP,
        this.buildTxOptions(options, GAS_LIMITS.CREATE_LAUNCH)
      );
    }

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Create a new INSTANT_LAUNCH
   */
  async createInstantLaunch(
    params: CreateInstantLaunchParams,
    options?: TxOptions
  ): Promise<TxResult> {
    this.requireSigner();

    // Validate params
    if (params.totalSupply !== 1000000000) {
      throw new Error('Total supply must be 1 billion for instant launch');
    }

    // Convert initial buy amount
    const initialBuyBNB = ethers.parseEther(params.initialBuyBNB);

    // Prepare metadata
    const metadata = [
      params.metadata.logoURI,
      params.metadata.description,
      params.metadata.website,
      params.metadata.twitter,
      params.metadata.telegram,
      params.metadata.discord,
    ];

    // Must send BNB with transaction
    const txOptions = this.buildTxOptions(options, GAS_LIMITS.CREATE_INSTANT_LAUNCH);
    txOptions.value = initialBuyBNB;

    // Call appropriate function
    let tx: ethers.ContractTransactionResponse;

    if (params.vanitySalt) {
      tx = await this.contract.createInstantLaunchWithVanity(
        params.name,
        params.symbol,
        params.totalSupply,
        metadata,
        initialBuyBNB,
        params.vanitySalt,
        params.burnLP,
        txOptions
      );
    } else {
      tx = await this.contract.createInstantLaunch(
        params.name,
        params.symbol,
        params.totalSupply,
        metadata,
        initialBuyBNB,
        params.burnLP,
        txOptions
      );
    }

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Contribute to a PROJECT_RAISE launch
   */
  async contribute(
    tokenAddress: string,
    bnbAmount: string,
    options?: TxOptions
  ): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const amount = ethers.parseEther(bnbAmount);
    const txOptions = this.buildTxOptions(options, GAS_LIMITS.CONTRIBUTE);
    txOptions.value = amount;

    const tx = await this.contract.contribute(tokenAddress, txOptions);

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Claim founder tokens (vested tokens)
   */
  async claimFounderTokens(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.claimFounderTokens(
      tokenAddress,
      this.buildTxOptions(options, GAS_LIMITS.CLAIM_FOUNDER_TOKENS)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Claim raised funds (vested BNB from raise)
   */
  async claimRaisedFunds(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.claimRaisedFunds(
      tokenAddress,
      this.buildTxOptions(options, GAS_LIMITS.CLAIM_RAISED_FUNDS)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Graduate pool to PancakeSwap
   */
  async graduateToPancakeSwap(tokenAddress: string, options?: TxOptions): Promise<TxResult> {
    this.requireSigner();
    this.validateAddress(tokenAddress);

    const tx = await this.contract.graduateToPancakeSwap(
      tokenAddress,
      this.buildTxOptions(options, GAS_LIMITS.GRADUATE_TO_PANCAKESWAP)
    );

    return {
      hash: tx.hash,
      wait: () => tx.wait(),
    };
  }

  /**
   * Get launch information
   */
  async getLaunchInfo(tokenAddress: string): Promise<LaunchInfo> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getLaunchInfo(tokenAddress);

    return {
      founder: info.founder,
      raiseTarget: info.raiseTarget,
      raiseMax: info.raiseMax,
      totalRaised: info.totalRaised,
      raiseDeadline: info.raiseDeadline,
      raiseCompleted: info.raiseCompleted,
      graduatedToPancakeSwap: info.graduatedToPancakeSwap,
      raisedFundsVesting: info.raisedFundsVesting,
      raisedFundsClaimed: info.raisedFundsClaimed,
      launchType: info.launchType,
      projectInfoFiWallet: info.projectInfoFiWallet,
      burnLP: info.burnLP,
    };
  }

  /**
   * Get launch information with USD values
   */
  async getLaunchInfoWithUSD(tokenAddress: string): Promise<LaunchInfoWithUSD> {
    this.validateAddress(tokenAddress);

    const info = await this.contract.getLaunchInfoWithUSD(tokenAddress);

    return {
      founder: info.founder,
      raiseTargetBNB: info.raiseTargetBNB,
      raiseTargetUSD: info.raiseTargetUSD,
      raiseMaxBNB: info.raiseMaxBNB,
      raiseMaxUSD: info.raiseMaxUSD,
      totalRaisedBNB: info.totalRaisedBNB,
      totalRaisedUSD: info.totalRaisedUSD,
      raiseDeadline: info.raiseDeadline,
      raiseCompleted: info.raiseCompleted,
      launchType: info.launchType,
      burnLP: info.burnLP,
    };
  }

  /**
   * Get claimable amounts for founder
   */
  async getClaimableAmounts(tokenAddress: string): Promise<ClaimableAmounts> {
    this.validateAddress(tokenAddress);

    const amounts = await this.contract.getClaimableAmounts(tokenAddress);

    return {
      claimableTokens: amounts.claimableTokens,
      claimableFunds: amounts.claimableFunds,
    };
  }

  /**
   * Get contribution info for an address
   */
  async getContribution(tokenAddress: string, contributor: string): Promise<ContributionInfo> {
    this.validateAddress(tokenAddress);
    this.validateAddress(contributor);

    const info = await this.contract.getContribution(tokenAddress, contributor);

    return {
      amount: info.amount,
      claimed: info.claimed,
    };
  }

  /**
   * Get all launches
   */
  async getAllLaunches(): Promise<string[]> {
    return await this.contract.getAllLaunches();
  }

  /**
   * Check if address is a valid launch
   */
  async isValidLaunch(tokenAddress: string): Promise<boolean> {
    try {
      const info = await this.getLaunchInfo(tokenAddress);
      return info.founder !== ethers.ZeroAddress;
    } catch {
      return false;
    }
  }

  /**
   * Get launch progress percentage
   */
  async getLaunchProgress(tokenAddress: string): Promise<number> {
    const info = await this.getLaunchInfo(tokenAddress);

    if (info.raiseTarget === 0n) {
      return 100;
    }

    const progress = Number((info.totalRaised * 10000n) / info.raiseTarget) / 100;
    return Math.min(progress, 100);
  }

  /**
   * Check if launch deadline has passed
   */
  async hasLaunchDeadlinePassed(tokenAddress: string): Promise<boolean> {
    const info = await this.getLaunchInfo(tokenAddress);
    const currentTime = Math.floor(Date.now() / 1000);
    return Number(info.raiseDeadline) < currentTime;
  }

  /**
   * Get time remaining until deadline
   */
  async getTimeUntilDeadline(tokenAddress: string): Promise<number> {
    const info = await this.getLaunchInfo(tokenAddress);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = Number(info.raiseDeadline) - currentTime;
    return Math.max(timeRemaining, 0);
  }

  /**
   * Listen to LaunchCreated events
   */
  onLaunchCreated(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('LaunchCreated', callback, filter);
  }

  /**
   * Listen to InstantLaunchCreated events
   */
  onInstantLaunchCreated(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('InstantLaunchCreated', callback, filter);
  }

  /**
   * Listen to ContributionMade events
   */
  onContributionMade(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('ContributionMade', callback, filter);
  }

  /**
   * Listen to RaiseCompleted events
   */
  onRaiseCompleted(callback: (event: any) => void, filter?: EventFilterOptions): () => void {
    return this.addEventListener('RaiseCompleted', callback, filter);
  }

  /**
   * Listen to GraduatedToPancakeSwap events
   */
  onGraduatedToPancakeSwap(
    callback: (event: any) => void,
    filter?: EventFilterOptions
  ): () => void {
    return this.addEventListener('GraduatedToPancakeSwap', callback, filter);
  }

  /**
   * Validate launch parameters
   */
  private validateLaunchParams(params: CreateLaunchParams): void {
    const minRaiseUSD = parseFloat(CONSTANTS.MIN_RAISE_USD);
    const maxRaiseUSD = parseFloat(CONSTANTS.MAX_RAISE_USD);
    const minVesting = CONSTANTS.MIN_VESTING_DURATION / (24 * 60 * 60);
    const maxVesting = CONSTANTS.MAX_VESTING_DURATION / (24 * 60 * 60);

    const raiseTarget = parseFloat(params.raiseTargetUSD);
    const raiseMax = parseFloat(params.raiseMaxUSD);

    if (raiseTarget < minRaiseUSD || raiseTarget > maxRaiseUSD) {
      throw new Error(`Raise target must be between $${minRaiseUSD} and $${maxRaiseUSD}`);
    }

    if (raiseMax < raiseTarget || raiseMax > maxRaiseUSD) {
      throw new Error(`Raise max must be between raise target and $${maxRaiseUSD}`);
    }

    if (params.vestingDuration < minVesting || params.vestingDuration > maxVesting) {
      throw new Error(`Vesting duration must be between ${minVesting} and ${maxVesting} days`);
    }

    if (!ethers.isAddress(params.projectInfoFiWallet)) {
      throw new Error('Invalid project InfoFi wallet address');
    }
  }
}
