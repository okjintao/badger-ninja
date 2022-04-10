import { EmissionSchedule, VaultDTO } from '@badger-dao/sdk';
import React from 'react';

interface Props {
  vault: VaultDTO;
  schedules: EmissionSchedule[];
}

function VaultSchedules({ vault, schedules }: Props): JSX.Element {
  const hasEmissionSchedules = schedules.length > 0;

  let emissionDisplay: React.ReactNode;
  if (hasEmissionSchedules) {
    emissionDisplay = schedules.map((s) => {
      return (
        <div key={`${s.token}-emission`} className="text-xs sm:text-sm grid grid-cols-4 text-gray-400">
          <div className="col-span-2">{s.token} Emission</div>
          <div>{s.amount.toFixed(3)}</div>
          <div>{`${s.compPercent}%`}</div>
        </div>
      );
    });
  } else {
    emissionDisplay = (
      <div className="text-sm mt-4 text-gray-300">
        {vault.name} has no active emission schedules.
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between bg-calm p-3 md:ml-2 rounded-lg mt-4 md:mt-0">
      <div>
        <div className="text-xs text-gray-400">Vault Emission Schedules</div>
        <div className="text-sm grid grid-cols-4 font-semibold mt-1">
          <span className="col-span-2">Token</span>
          <span>Amount</span> 
          <span>Completion</span> 
        </div>
        {emissionDisplay}
      </div>
      <div>
        <div className="text-xs mt-2">What are Emission Schedules?</div>
        <div className="text-xs mt-1 mb-1 text-gray-400">
          Emission schedules are how Badger distributes rewards to depositors.
          A set number of a specific token is distributed to the vault over
          any given duration. These tokens are distributed either pro rata or
          in a boosted manner dependent on the token emitted.
        </div>
      </div>
    </div>
  );
}

export default VaultSchedules;
