import { VaultDTO } from '@badger-dao/sdk';
import React from 'react';

import VaultStatistic from '../VaultStatistic';

interface Props {
  vault: VaultDTO;
}

function VaultHarvestHealth({ vault }: Props): JSX.Element {
  const { protocol, yieldProjection } = vault;
  const {
    harvestValue,
    yieldValue,
    yieldTokens,
    harvestTokens,
    yieldApr,
    harvestApr,
  } = yieldProjection;
  const realizedHarvestPercent =
    yieldValue === 0 ? 100 : (harvestValue / yieldValue) * 100;
  return (
    <div className="mt-10">
      <div className="text-sm">Vault Harvest Health</div>
      <div className="bg-card p-3 md:p-4 mt-4 rounded-lg mx-2 md:mx-0">
        <div
          className={`text-xl ${
            realizedHarvestPercent > 100
              ? 'text-electric text-shadow'
              : realizedHarvestPercent > 97
              ? 'text-green-400'
              : realizedHarvestPercent > 94
              ? 'text-orange-400'
              : 'text-red-400'
          }`}
        >
          {realizedHarvestPercent.toFixed(2)}% Realized Yield
        </div>
        <div className="text-xs mt-2">What is Harvest Health?</div>
        <div className="text-xs mt-1 text-gray-400">
          Harvest health is a measure of a strategy performance. Pending yield
          is the current yield being realized by the vault from the protocol
          being farmed. Pending harvest is the current simulated yield being
          realized by the vault when harvested. This measure most accurately
          reflects the current yield the vault is experiencing with respect to
          market conditions and other externalities.
        </div>
        <div className="grid grid-cols-2 mt-3">
          <div className="flex flex-col">
            <div className="text-xs">Pending Yield ({protocol})</div>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
              {yieldTokens.filter((t) => t.balance > 0).map((t) => (
                <VaultStatistic
                  key={`yield-${t.address}`}
                  title={t.symbol}
                  value={t.balance.toFixed(5)}
                  subtext={
                    <div className="text-xs text-gray-400">
                      ${t.value.toFixed(2)}
                    </div>
                  }
                />
              ))}
            </div>
            <div className="text-xs mt-2">
              Total: {yieldValue.toFixed(2)} ({yieldApr.toFixed(2)}% APR)
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xs">Pending Harvest</div>
            <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
              {harvestTokens.filter((t) => t.balance > 0).map((t) => (
                <VaultStatistic
                  key={`harvest-${t.address}`}
                  title={t.symbol}
                  value={t.balance.toFixed(5)}
                  subtext={
                    <div className="text-xs text-gray-400">
                      ${t.value.toFixed(2)}
                    </div>
                  }
                />
              ))}
            </div>
            <div className="text-xs mt-2">
              Total: {harvestValue.toFixed(2)} ({harvestApr.toFixed(2)}% APR)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VaultHarvestHealth;
