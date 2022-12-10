import { BigNumber, utils, BigNumberish } from 'ethers';

export const isAddress = (value: string): boolean => utils.isAddress(value);

export const toChecksumAddress = (value: string): string => utils.getAddress(value);

export const toWei = (value: string, uintName = 'ether') => utils.parseUnits(String(value), uintName);

export const hexToNumber = (hex: string) => BigNumber.from(hex).toNumber();

export const numberToHex = (value: number) => utils.hexlify(value);

export const fromWei = (balance: BigNumberish) => utils.formatUnits(balance, 18);

export const getToIntegerMultiplier = (): BigNumber => toWei('1', 'ether');

// helper to convert big number (not safe) to number
export const bnToNumber = (n: null | BigNumber): number => {
  try {
    if (!n) return 0;
    return parseFloat(utils.formatUnits(n)) * 10 ** 18;
  } catch (error) {
    console.error('bnToNumber', error);
    return 0;
  }
};

// helper to convert number to big number
export const numberToBn = (n: null | number): BigNumber => {
  try {
    if (!n) return utils.parseEther('0');
    return utils.parseEther(String(n));
  } catch (error) {
    console.error('numberToBn', error);
    return utils.parseEther('0');
  }
};