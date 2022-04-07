import { InjectedConnector } from '@web3-react/injected-connector';
import { AbstractConnector } from '@web3-react/abstract-connector';
import { CHAIN_ID } from '../constants';
import { ConnectorType } from '../enums/connector-type.enum';

const supportedChainIds = [CHAIN_ID];
const injected = new InjectedConnector({ supportedChainIds });

export const connectorsByType: {
  [connectorName in ConnectorType]: AbstractConnector;
} = {
  [ConnectorType.Injected]: injected,
};
