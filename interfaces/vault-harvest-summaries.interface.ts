import { VaultHarvestSummary } from "./vault-harvest-summary.interface";

export interface VaultHarvestSummaries {
  alertVaults: VaultHarvestSummary[];
  borderlineVaults: VaultHarvestSummary[];
  healthyVaults: VaultHarvestSummary[];
}
