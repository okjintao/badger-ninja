import BadgerSDK from '@badger-dao/sdk';
import { CHAIN_ID } from '../config/constants';
import { ProtocolStore } from './ProtocolStore';

export class RootStore {
  public sdk = new BadgerSDK({
    network: CHAIN_ID,
    provider: '',
  });

  public protocol: ProtocolStore;

  constructor() {
    this.protocol = new ProtocolStore(this);
  }
}
