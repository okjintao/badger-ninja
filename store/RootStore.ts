import BadgerSDK from '@badger-dao/sdk';
import { makeAutoObservable } from 'mobx';
import { CHAIN_ID } from '../config/constants';
import { ProtocolStore } from './ProtocolStore';
import { UserStore } from './UserStore';
import { VaultStore } from './VaultStore';

export class RootStore {
  public updatedAt = 0;
  public sdk = new BadgerSDK({
    network: CHAIN_ID,
    provider: '',
    baseURL: 'https://staging-api.badger.com',
  });

  public protocol: ProtocolStore;
  public user: UserStore;
  public vaults: VaultStore;

  constructor() {
    this.protocol = new ProtocolStore(this);
    this.user = new UserStore(this);
    this.vaults = new VaultStore(this);
    makeAutoObservable(this);
  }

  async updateData() {
    await this.protocol.loadProtocolData();
    this.updatedAt = Date.now();
  }
}
