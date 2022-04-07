export function shortenAddress(address: string, length = 4) {
  return address
    .slice(0, length)
    .concat('...')
    .concat(address.slice(address.length - length));
}
