import { makeAutoObservable } from "mobx";
import { RootStore } from "./RootStore";

export class VaultStore {

  constructor(private store: RootStore) {
    makeAutoObservable(this);
  }
}