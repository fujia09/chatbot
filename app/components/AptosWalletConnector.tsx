"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { PetraWallet, PetraWalletName } from "petra-plugin-wallet-adapter";
import { checkPokeCoinBalance } from "../utils/pokeUtils";

// Create a context to share wallet state
const WalletContext = createContext<{
  wallet: any;
  account: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}>({
  wallet: null,
  account: null,
  connected: false,
  connect: async () => {},
  disconnect: async () => {},
});

export const useWallet = () => useContext(WalletContext);

// Simplified wallet connector that only supports Petra wallet
export function WalletConnectButton() {
  const { connect, account, disconnect, connected } = useWallet();
  const [pokeCoinBalance, setPokeCoinBalance] = useState<number | null>(null);

  // Fetch PokeCoin balance when connected
  useEffect(() => {
    if (connected && account) {
      const fetchBalance = async () => {
        const balance = await checkPokeCoinBalance(account);
        setPokeCoinBalance(balance);
      };

      fetchBalance();

      // Refresh balance every 30 seconds
      const intervalId = setInterval(fetchBalance, 30000);
      return () => clearInterval(intervalId);
    }
  }, [connected, account]);

  return (
    <div className="wallet-connect">
      {!connected ? (
        <button onClick={connect} className="wallet-button">
          Connect Petra Wallet
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </span>
          {pokeCoinBalance !== null && (
            <span className="pokecoin-balance">{pokeCoinBalance} PokeCoin</span>
          )}
          <button onClick={disconnect} className="disconnect-button">
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
}

// Simplified provider that doesn't require the full adapter package
export function AptosWalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [wallet, setWallet] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check if Petra is available in the browser
    const checkPetraAvailability = async () => {
      try {
        if ("aptos" in window) {
          setWallet(window.aptos);

          // Check if already connected
          const isConnected = await window.aptos.isConnected();
          if (isConnected) {
            const acc = await window.aptos.account();
            setAccount(acc.address);
            setConnected(true);
          }
        }
      } catch (error) {
        console.error("Petra wallet not found:", error);
      }
    };

    checkPetraAvailability();
  }, []);

  const connect = async () => {
    if (!wallet) {
      alert("Please install Petra wallet extension");
      return;
    }

    try {
      const response = await wallet.connect();
      setAccount(response.address);
      setConnected(true);

      // Enhanced logging
      console.log("=== WALLET CONNECTION INFO ===");
      console.log("Connected wallet address:", response.address);
      console.log("Full response:", response);

      // Make the address available globally
      window.connectedWalletAddress = response.address;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnect = async () => {
    if (wallet) {
      try {
        await wallet.disconnect();
        setAccount(null);
        setConnected(false);

        // Clear the global address
        window.connectedWalletAddress = null;
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{ wallet, account, connected, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// Add this to make TypeScript happy with our window extension
declare global {
  interface Window {
    aptos?: any;
    connectedWalletAddress?: string | null;
  }
}
