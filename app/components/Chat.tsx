"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Message } from "ai";
import { checkPokeCoinBalance, burnPokeCoin } from "../utils/pokeUtils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Get the wallet address from your connector
  const { account, connected, wallet } = useWallet();

  // If you're not using the adapter, you can get it directly:
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check if window.aptos exists and is connected
    const checkWalletConnection = async () => {
      if (window.aptos) {
        try {
          const isConnected = await window.aptos.isConnected();
          if (isConnected) {
            const account = await window.aptos.account();
            setWalletAddress(account.address);
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Use the wallet address from the state
    const currentWalletAddress =
      walletAddress || window.aptos?.account?.address || account;

    if (!currentWalletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    console.log("=== CHAT COMPONENT WALLET INFO ===");
    console.log("Current wallet address from state:", walletAddress);
    console.log(
      "Current wallet address from window.aptos:",
      window.aptos?.account?.address
    );
    console.log("Current wallet address from useWallet hook:", account);
    console.log("Final wallet address being used:", currentWalletAddress);

    // Check PokeCoin balance before proceeding
    setIsProcessingPayment(true);
    try {
      const balance = await checkPokeCoinBalance(currentWalletAddress);
      console.log("PokeCoin balance:", balance);

      if (balance < 1) {
        toast.error("You need at least 1 PokeCoin to use the chatbot");
        setIsProcessingPayment(false);
        return;
      }

      // Burn 1 PokeCoin
      const currentWallet = wallet || window.aptos;
      const burnSuccess = await burnPokeCoin(currentWallet);

      if (!burnSuccess) {
        toast.error("Failed to process PokeCoin payment");
        setIsProcessingPayment(false);
        return;
      }

      toast.success("Successfully burned 1 PokeCoin for this chat");
    } catch (error) {
      console.error("Error processing PokeCoin payment:", error);
      toast.error("Error processing PokeCoin payment");
      setIsProcessingPayment(false);
      return;
    }
    setIsProcessingPayment(false);

    // Add user message to the chat
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      console.log(
        "Sending request to API with wallet address:",
        currentWalletAddress
      );
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          walletAddress: currentWalletAddress,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.content },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, there was an error processing your request. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
        {isLoading && <div className="loading">Thinking...</div>}
        {isProcessingPayment && (
          <div className="loading">Processing PokeCoin payment...</div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something... (costs 1 PokeCoin)"
          disabled={isLoading || isProcessingPayment}
        />
        <button type="submit" disabled={isLoading || isProcessingPayment}>
          Send
        </button>
      </form>
    </div>
  );
}
