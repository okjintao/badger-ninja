import BadgerSDK, { LogLevel, Network, SDKProvider } from '@badger-dao/sdk';
import { Web3Provider } from '@ethersproject/providers';
import { makeAutoObservable } from 'mobx';

import { getBadgerApiUrl } from '../config/config.utils';
import { CHAIN_ID } from '../config/constants';
import { RootStore } from './RootStore';

export class UserStore {
  public address?: string;

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  async updateNetwork(provider: SDKProvider, network: Network) {
    await this.store.sdk.ready();
    this.store.sdk = new BadgerSDK({
      network,
      provider,
      baseURL: getBadgerApiUrl(),
      logLevel: LogLevel.Debug,
    });
  }
}
