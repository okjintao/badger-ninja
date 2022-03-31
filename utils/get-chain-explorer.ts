import { Network } from '@badger-dao/sdk';

export function getChainExplorer(network: Network) {
  switch (network) {
    case Network.Fantom:
      return 'https://ftmscan.com';
    case Network.Avalanche:
      return 'https://snowtrace.io';
    case Network.Arbitrum:
      return 'https://arbiscan.io';
    case Network.Polygon:
      return 'https://polygonscan.com';
    case Network.BinanceSmartChain:
      return 'https://bscscan.com';
    default:
      return 'https://etherscan.io';
  }
}
