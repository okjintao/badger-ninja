import { Network, NetworkConfig } from '@badger-dao/sdk';
import { toast } from 'react-toastify';

// https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
// export async function switchOrAddNetwork(network: Network): Promise<boolean> {
//   const config = NetworkConfig.getConfig(network);
//   const { id } = config;
//   const { ethereum } = window;
//   if (ethereum) {
//     try {
//       await ethereum.request({
//         method: 'wallet_switchEthereumChain',
//         params: [{ chainId: id }],
//       });
//       return true;
//     } catch (error) {
//       // @ts-ignore
//       if (error.code === 4902) {
//         try {
//           await ethereum.request({
//             method: 'wallet_addEthereumChain',
//             params: [
//               {
//                 chainId: `0x${id}`,
//                 chainName: chain.name,
//                 nativeCurrency: {
//                   name: chain.network.toUpperCase(),
//                   symbol: chain.network.toLowerCase(),
//                   decimals: 18,
//                 },
//                 rpcUrls: [RPC[chain.network]],
//                 blockExplorerUrls: [chain.explorer],
//               },
//             ],
//           });
//           return true;
//         } catch (addError) {
//           toast(`Unable to switch to or add ${chain.name}`, {
//             position: 'bottom-right',
//             type: 'error',
//           });
//           return false;
//         }
//       }
//       return false;
//     }
//   }
//   return false;
// }
