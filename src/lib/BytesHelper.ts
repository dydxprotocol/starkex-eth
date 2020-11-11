export function stripHexPrefix(input: string) {
  if (input.startsWith('0x')) {
    return input.slice(2);
  }
  return input;
}

export function addressesAreEqual(
  addressOne: string,
  addressTwo: string,
): boolean {
  return !!(addressOne && addressTwo &&
    (stripHexPrefix(addressOne).toLowerCase() === stripHexPrefix(addressTwo).toLowerCase()));
}
