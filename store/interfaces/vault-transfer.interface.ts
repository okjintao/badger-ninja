import { TransferType } from "../enums/transfer-type.enum";

export interface VaultTransfer {
  amount: number;
  date: string;
  from: string;
  hash: string;
  to: string;
  type: TransferType;
}