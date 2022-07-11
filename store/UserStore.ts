import { makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";
import { Web3Provider } from '@ethersproject/providers';
import BadgerSDK from "@badger-dao/sdk";
import { CHAIN_ID } from "../config/constants";

export class UserStore {
  public address?: string;

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }

  async updateProvider(provider: Web3Provider) {
    // there is a bug where we can't dynamically update sdk atm
    this.store.sdk = new BadgerSDK({ network: CHAIN_ID, provider });
    await this.store.sdk.ready();
  }
}