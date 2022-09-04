import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import { useCallback } from 'react';
import { toast } from 'react-toastify';

import { CHAIN_ID } from '../config/constants';
import { ConnectorType } from '../config/enums/connector-type.enum';
import { connectorsByType } from '../config/web3/providers.config';
// import { switchOrAddNetwork } from '../utils/switch-or-add-network';

const useWallet = () => {
  const { chainId, activate, deactivate } = useWeb3React();

  const connect = useCallback(
    (type: ConnectorType) => {
      const connector = connectorsByType[type];
      if (connector) {
        activate(connector, async (error: Error) => {
          if (error instanceof UnsupportedChainIdError) {
            // const successfulSwap = await switchOrAddNetwork(
            //   Chain.getChain(CHAIN_ID),
            // );
            // if (successfulSwap) {
            //   await activate(connector);
            // }
          } else {
            toast('Authorize wallet to access your account', {
              position: 'bottom-right',
              type: 'info',
            });
          }
        });
      } else {
        toast('Unsupported wallet connector', {
          position: 'bottom-right',
          type: 'info',
        });
      }
    },
    [activate],
  );

  const disconnect = useCallback(() => {
    deactivate();
  }, [deactivate, chainId]);

  return { connect, disconnect };
};

export default useWallet;
