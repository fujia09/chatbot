"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { PetraWallet, PetraWalletName } from "petra-plugin-wallet-adapter";
import { checkPokeCoinBalance, POKECOIN_DECIMALS } from "../utils/pokeUtils";

// Create a context to share wallet state
const WalletContext = createContext<{
  wallet: any;
  account: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  balance: number | null;
}>({
  wallet: null,
  account: null,
  connected: false,
  connect: async () => {},
  disconnect: async () => {},
  balance: null,
});

export const useWallet = () => useContext(WalletContext);

// Simplified wallet connector that only supports Petra wallet
export function WalletConnectButton() {
  const { connect, account, disconnect, connected, balance } = useWallet();

  // Format the balance
  const formattedBalance = balance
    ? (balance / POKECOIN_DECIMALS).toFixed(2)
    : "0.00";

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
          <span className="pokecoin-balance">{formattedBalance} PokeCoin</span>
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
  const [balance, setBalance] = useState<number | null>(null);

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
            const balance = await checkPokeCoinBalance(acc.address);
            setBalance(balance);
          }
        }
      } catch (error) {
        console.error("Petra wallet not found:", error);
      }
    };

    checkPetraAvailability();

    // Add balance fetching logic
    async function fetchBalance() {
      if (connected && account) {
        try {
          const pokeCoinBalance = await checkPokeCoinBalance(account);
          setBalance(pokeCoinBalance);
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    }

    fetchBalance();

    // Set up a refresh interval
    const intervalId = setInterval(fetchBalance, 30000); // Refresh every 30 seconds

    return () => clearInterval(intervalId);
  }, [account, connected]);

  const connect = async () => {
    if (!wallet) {
      alert("Please install Petra wallet extension");
      return;
    }

    try {
      const response = await wallet.connect();
      setAccount(response.address);
      setConnected(true);
      const balance = await checkPokeCoinBalance(response.address);
      setBalance(balance);

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
        setBalance(null);

        // Clear the global address
        window.connectedWalletAddress = null;
      } catch (error) {
        console.error("Failed to disconnect wallet:", error);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{ wallet, account, connected, connect, disconnect, balance }}
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
