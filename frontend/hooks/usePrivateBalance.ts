'use client';

import { useMemo } from 'react';

export interface AccountWithBalances {
  balances?: {
    shieldedNight: string;
    shieldedDust: string;
    shieldedtCyphra: string;
    unshieldedNight: string;
  };
  shieldedBalances?: Record<string, bigint>;
  unshieldedBalances?: Record<string, bigint>;
  dustBalance?: {
    balance: bigint;
    cap: bigint;
  };
}

export function formatTokenAmount(amount: bigint | undefined, decimals = 6): string {
  if (amount === undefined) return '0.00';
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const remainder = amount % divisor;
  const remainderStr = remainder.toString().padStart(decimals, '0').slice(0, 2);
  return `${integerPart.toLocaleString()}.${remainderStr}`;
}

export function usePrivateBalance(account: AccountWithBalances | null) {
  const balances = useMemo(() => {
    if (!account) {
      return {
        shieldedNight: '0.00',
        shieldedDust: '0.00',
        shieldedtCyphra: '0.00',
        unshieldedNight: '0.00',
        dustCap: '0.00',
        hasFunds: false,
      };
    }

    if (account.balances) {
      const sNight = parseFloat(account.balances.shieldedNight.replace(/,/g, '')) || 0;
      const stCyphra = parseFloat(account.balances.shieldedtCyphra.replace(/,/g, '')) || 0;
      return {
        shieldedNight: account.balances.shieldedNight,
        shieldedDust: account.balances.shieldedDust,
        shieldedtCyphra: account.balances.shieldedtCyphra,
        unshieldedNight: account.balances.unshieldedNight,
        dustCap: '100.00',
        hasFunds: sNight > 0 || stCyphra > 0,
      };
    }

    const sNight = account.shieldedBalances?.['NIGHT'] ?? 0n;
    const sDust = account.shieldedBalances?.['DUST'] ?? account.dustBalance?.balance ?? 0n;
    const stCyphra = account.shieldedBalances?.['tCYPHRA'] ?? 0n;
    const uNight = account.unshieldedBalances?.['NIGHT'] ?? 0n;
    const dustCap = account.dustBalance?.cap ?? 100_000_000n;

    return {
      shieldedNight: formatTokenAmount(sNight),
      shieldedDust: formatTokenAmount(sDust),
      shieldedtCyphra: formatTokenAmount(stCyphra),
      unshieldedNight: formatTokenAmount(uNight),
      dustCap: formatTokenAmount(dustCap),
      hasFunds: sNight > 0n || stCyphra > 0n,
    };
  }, [account]);

  return balances;
}
