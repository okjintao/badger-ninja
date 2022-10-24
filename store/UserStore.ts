import BadgerSDK, { LogLevel, Network } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { makeAutoObservable } from 'mobx';

import { getBadgerApiUrl } from '../config/config.utils';
import { CHAIN_ID } from '../config/constants';
import { RootStore } from './RootStore';

export class UserStore {
  private cachedProvider?: Web3Provider;
  public address?: string;

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  async updateProvider(provider: Web3Provider) {
    this.cachedProvider = provider;
    this.store.sdk = new BadgerSDK({
      network: CHAIN_ID,
      provider,
      baseURL: getBadgerApiUrl(),
      logLevel: LogLevel.Debug,
    });
  }

  async updateNetwork(network: Network) {
    if (!this.cachedProvider) {
      return;
    }
    await this.store.sdk.ready();
    this.store.sdk = new BadgerSDK({
      network,
      provider: this.cachedProvider,
      baseURL: getBadgerApiUrl(),
      logLevel: LogLevel.Debug,
    });
  }
}
