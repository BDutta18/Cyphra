'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  oneAMWallet,
  OneAMWalletState,
  SupportedNetwork,
  WalletUnavailableError,
  WalletRejectionError,
  WrongNetworkError,
} from '../lib/one-am-wallet-adapter';

export function useMidnightWallet() {
  const [walletState, setWalletState] = useState<OneAMWalletState>(() => oneAMWallet.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to OneAMWalletAdapter state updates
  useEffect(() => {
    const unsubscribe = oneAMWallet.subscribe((state) => {
      setWalletState(state);
    });

    oneAMWallet.detectWallet().then((detected) => {
      setIsWalletAvailable(!!detected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Connect 1AM Wallet
  const connect = useCallback(async (network: SupportedNetwork = 'preview') => {
    setIsConnecting(true);
    setError(null);
    try {
      const state = await oneAMWallet.connectWallet(network);
      return state;
    } catch (err) {
      let message = 'Failed to connect to 1AM Wallet.';
      if (err instanceof WalletUnavailableError) {
        message = err.message;
      } else if (err instanceof WalletRejectionError) {
        message = 'Connection request was cancelled in 1AM Wallet.';
      } else if (err instanceof WrongNetworkError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Disconnect 1AM Wallet
  const disconnect = useCallback(async () => {
    await oneAMWallet.disconnectWallet();
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Format account details for components
  const account = walletState.isConnected && walletState.addresses ? {
    isConnected: true,
    walletName: walletState.walletName || '1AM Wallet',
    networkId: walletState.network,
    shieldedAddress: walletState.addresses.shieldedAddress,
    shieldedCoinPublicKey: walletState.addresses.shieldedCoinPublicKey,
    shieldedEncryptionPublicKey: walletState.addresses.shieldedEncryptionPublicKey,
    unshieldedAddress: walletState.addresses.unshieldedAddress,
    dustAddress: walletState.addresses.dustAddress,
    balances: walletState.balances,
    isSimulated: walletState.isSandbox || false,
  } : null;

  return {
    account,
    isConnected: walletState.isConnected,
    isConnecting,
    isWalletAvailable,
    isSandbox: walletState.isSandbox || false,
    network: walletState.network,
    balances: walletState.balances,
    error,
    clearError,
    connect,
    connectSandbox: (network?: SupportedNetwork) => oneAMWallet.connectSandbox(network),
    disconnect,
    setNetwork: (network: SupportedNetwork) => oneAMWallet.setNetwork(network),
    refreshBalances: () => oneAMWallet.refreshBalances(),
  };
}
