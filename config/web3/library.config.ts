import { ExternalProvider, Web3Provider } from '@ethersproject/providers';

interface ExternalProviderExtended extends ExternalProvider {
  chainId?: number | string;
}

export function getLibrary(provider: ExternalProviderExtended): Web3Provider {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : 'any',
  );
  library.pollingInterval = 15000;
  return library;
}
