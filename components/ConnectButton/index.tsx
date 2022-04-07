import { useWeb3React } from '@web3-react/core';
import { observer } from 'mobx-react-lite';
import React, { useContext, useEffect } from 'react';
import { ConnectorType } from '../../config/enums/connector-type.enum';
import useWallet from '../../hooks/useWallet';
import { StoreContext } from '../../store/StoreContext';
import { shortenAddress } from '../../utils';

const ConnectButton = observer((): JSX.Element => {
  const { connect, disconnect } = useWallet();
  const { active, account } = useWeb3React();

  useEffect(() => {
    if (!account) {
      connect(ConnectorType.Injected);
    }
  }, []);

  async function handleClick() {
    if (!active) {
      connect(ConnectorType.Injected);
    } else {
      disconnect();
    }
  }

  return (
    <div
      className="w-18 md:w-28 flex justify-center border p-2 text-sm rounded-md bg-deepsea shadow-lg cursor-pointer border-mint text-white"
      onClick={handleClick}
    >
      {!active && <div className="text-md leading-tight">Connect</div>}
      {account && (
        <>
          <div className="hidden md:flex text-md leading-tight">{shortenAddress(account)}</div>
          <div className="md:hidden flex text-md leading-tight">{shortenAddress(account, 3)}</div>
        </>
      )}
    </div>
  );
});

export default ConnectButton;
