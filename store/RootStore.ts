import BadgerSDK from '@badger-dao/sdk';
import { CHAIN_ID } from '../config/constants';

export class RootStore {
  public sdk = new BadgerSDK({ network: CHAIN_ID, provider: '', baseURL: 'https://staging-api.badger.com/v2' });
}
