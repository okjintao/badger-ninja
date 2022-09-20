import { VaultDTOV3 } from '@badger-dao/sdk';
import React from 'react';

interface Props {
  vault: VaultDTOV3;
}

function toAprRange(apy: number, minApr?: number, maxApr?: number) {
  return minApr && maxApr && minApr !== maxApr
    ? `${minApr.toFixed(2)}% - ${maxApr.toFixed(2)}%`
    : `${apy.toFixed(2)}%`;
}

function VaultAprSources({ vault }: Props): JSX.Element {
  const { apy } = vault;

  const currentYieldDisplay = toAprRange(
    apy.baseYield,
    apy.minYield,
    apy.maxYield,
  );

  let yieldDisplay: React.ReactNode;
  if (vault.apy.sources.length > 0) {
    yieldDisplay = vault.apy.sources.map((s) => (
      <div
        key={s.name}
        className="text-xs sm:text-sm w-full flex justify-between text-gray-400"
      >
        <div>{s.name}</div>
        <div>
          {toAprRange(
            s.performance.baseYield,
            s.performance.minYield,
            s.performance.maxYield,
          )}
        </div>
      </div>
    ));
  } else {
    yieldDisplay = (
      <div className="text-sm mt-4 text-gray-300">
        {vault.name} has no recorded yield sources.
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="text-sm">Vault Historic Performance</div>
      <div className="bg-card p-3 md:mr-2 rounded-lg mt-4">
        <div className="text-sm font-semibold flex justify-between mt-1">
          <span>Emission Source</span>
          <span>APR</span>
        </div>
        {yieldDisplay}
        <div className="text-xs sm:text-sm w-full flex justify-between mt-1">
          <div>Total</div>
          <div>{currentYieldDisplay}</div>
        </div>
        <div className="text-xs mt-2">What are Vault APR Sources?</div>
        <div className="text-xs mt-1 mb-1 text-gray-400">
          Vault APR Sources are a 21 day TWAY (Time Weighted Average Yield) of
          the vault given fluctations in yield and TVL. This value will almost
          never match the spot yield, and reflects a more long term yield
          history of the vault.
        </div>
      </div>
    </div>
  );
}

export default VaultAprSources;
