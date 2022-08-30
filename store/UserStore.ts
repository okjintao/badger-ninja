import BadgerSDK from '@badger-dao/sdk';
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

  async updateProvider(provider: Web3Provider) {
    this.store.sdk = new BadgerSDK({
      network: CHAIN_ID,
      provider,
      baseURL: getBadgerApiUrl(),
    });
    await this.store.sdk.ready();
  }
}
