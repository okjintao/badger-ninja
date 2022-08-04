import { TransferType } from '../enums/transfer-type.enum';

export interface VaultTransfer {
  amount: number;
  date: number;
  from: string;
  hash: string;
  to: string;
  type: TransferType;
}
