'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  oneAMWallet,
  OneAMWalletState,
  SupportedNetwork,
  WalletUnavailableError,
  WalletRejectionError,
  WalletSyncingError,
  WrongNetworkError,
} from '../lib/one-am-wallet-adapter';

let globalModalOpen = false;
const modalListeners = new Set<(open: boolean) => void>();

function setGlobalModalOpen(open: boolean) {
  globalModalOpen = open;
  modalListeners.forEach((fn) => fn(open));
}

export function useMidnightWallet() {
  const [walletState, setWalletState] = useState<OneAMWalletState>(() => oneAMWallet.getState());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isWalletAvailable, setIsWalletAvailable] = useState(() => !!oneAMWallet.getInitialApi());
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedApi, setDetectedApi] = useState(() => oneAMWallet.getInitialApi());
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(globalModalOpen);
  const [error, setError] = useState<string | null>(null);
  const [syncProgress, setSyncProgress] = useState<number>(0);

  useEffect(() => {
    const listener = (open: boolean) => setIsConnectModalOpen(open);
    modalListeners.add(listener);
    return () => {
      modalListeners.delete(listener);
    };
  }, []);

  const openConnectModal = useCallback(() => {
    setGlobalModalOpen(true);
  }, []);

  const closeConnectModal = useCallback(() => {
    setGlobalModalOpen(false);
  }, []);

  const detectWallet = useCallback(async (timeoutMs = 350) => {
    if (oneAMWallet.getInitialApi()) {
      const api = oneAMWallet.getInitialApi();
      setDetectedApi(api);
      setIsWalletAvailable(true);
      return api;
    }
    setIsDetecting(true);
    try {
      const detected = await oneAMWallet.detectWallet(timeoutMs);
      setDetectedApi(detected);
      setIsWalletAvailable(!!detected);
      return detected;
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Subscribe to OneAMWalletAdapter state updates
  useEffect(() => {
    const unsubscribe = oneAMWallet.subscribe((state) => {
      setWalletState(state);
    });

    if (!oneAMWallet.getInitialApi()) {
      detectWallet(350);
    } else {
      setIsWalletAvailable(true);
    }

    return () => {
      unsubscribe();
    };
  }, [detectWallet]);

  // Auto-recover from sync: poll every 8s, reconnect silently when sync clears
  useEffect(() => {
    if (!walletState.isSyncing || walletState.isSandbox) return;

    let attempt = 0;

    const interval = setInterval(async () => {
      attempt += 1;
      // Animate sync progress 0→100 over 10 attempts (~80s max)
      setSyncProgress(Math.min(100, Math.round((attempt / 10) * 100)));

      try {
        // Try refreshing balances — succeeds once 1AM finishes syncing
        await oneAMWallet.refreshBalances();
        const currentState = oneAMWallet.getState();
        if (!currentState.isSyncing) {
          clearInterval(interval);
          setSyncProgress(100);
          // Auto-reconnect silently after sync completes
          oneAMWallet.connectWallet(currentState.network).catch(() => {});
        }
      } catch {
        // Still syncing — keep polling
      }
    }, 8000);

    return () => {
      clearInterval(interval);
      setSyncProgress(0);
    };
  }, [walletState.isSyncing, walletState.isSandbox]);

  // Connect 1AM Wallet
  const connect = useCallback(async (network: SupportedNetwork = 'preprod') => {
    setIsConnecting(true);
    setError(null);
    try {
      const state = await oneAMWallet.connectWallet(network);
      return state;
    } catch (err) {
      let message = 'Failed to connect to 1AM Wallet.';
      if (err instanceof WalletUnavailableError) {
        message = err.message;
      } else if (err instanceof WalletSyncingError) {
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

  // Connect instant demo account (Preprod simulated)
  const connectDemo = useCallback(async (network: SupportedNetwork = 'preprod') => {
    setIsConnecting(true);
    setError(null);
    try {
      const state = await oneAMWallet.connectDemo(network);
      return state;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  // Format account details for components
  const account = walletState.isConnected && walletState.addresses ? {
    isConnected: true,
    walletName: walletState.walletName || (walletState.isSandbox ? 'Preprod Demo Wallet' : '1AM Wallet'),
    networkId: walletState.network,
    shieldedAddress: walletState.addresses.shieldedAddress,
    shieldedCoinPublicKey: walletState.addresses.shieldedCoinPublicKey,
    shieldedEncryptionPublicKey: walletState.addresses.shieldedEncryptionPublicKey,
    unshieldedAddress: walletState.addresses.unshieldedAddress,
    dustAddress: walletState.addresses.dustAddress,
    balances: walletState.balances,
    isSimulated: walletState.isSandbox,
    isSyncing: walletState.isSyncing || false,
  } : null;

  return {
    account,
    isConnected: walletState.isConnected,
    isConnecting,
    isWalletAvailable,
    isDetecting,
    detectedApi,
    detectWallet,
    isConnectModalOpen,
    openConnectModal,
    closeConnectModal,
    isSandbox: walletState.isSandbox,
    isSyncing: walletState.isSyncing || false,
    syncProgress,
    network: walletState.network,
    balances: walletState.balances,
    error,
    clearError,
    connect,
    connectWebWallet: connect,
    connectDemo,
    connectSandbox: connectDemo,
    disconnect,
    setNetwork: (network: SupportedNetwork) => oneAMWallet.setNetwork(network),
    refreshBalances: () => oneAMWallet.refreshBalances(),
    getWalletTxHistory: (page?: number, size?: number) => oneAMWallet.getWalletTxHistory(page, size),
  };
}
