import BadgerSDK from '@badger-dao/sdk';
import { makeAutoObservable } from 'mobx';
import { CHAIN_ID } from '../config/constants';
import { ProtocolStore } from './ProtocolStore';
import { UserStore } from './UserStore';

export class RootStore {
  public updatedAt = 0;
  public sdk = new BadgerSDK({
    network: CHAIN_ID,
    provider: '',
  });

  public protocol: ProtocolStore;
  public user: UserStore;

  constructor() {
    this.protocol = new ProtocolStore(this);
    this.user = new UserStore(this);
    makeAutoObservable(this);
  }

  async updateData() {
    console.log('Updating data!');
    await Promise.all([
      this.protocol.loadProtocolData(),
    ]);
    this.updatedAt = Date.now();
    console.log(`Updated at: ${this.updatedAt}`);
  }
}
