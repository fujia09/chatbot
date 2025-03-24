"use client";

import { Types } from "aptos";
import { AptosClient, FungibleAssetClient, Provider, Network, Account } from "@aptos-labs/ts-sdk";

// PokeCoin module address
// const POKECOIN_ADDRESS = "0x066ebb982c492c0d5b1f2b8089756f83fd31d4516cd9a1fc0b63b4961e4eeafd";
const POKECOIN_ADDRESS = "0xb6e33eae3e6875918b3178360845e35ba6de59f85fe71461a64207d5211ef8fd";
// Recipient address for PokeCoin payments
const RECIPIENT_ADDRESS = "0x991116f7109cf49bff184086d89f8a69773d3ceda1817c35b9bd3c9baf8c64dd";

// Use mainnet GraphQL endpoint
const GRAPHQL_URL = "https://indexer.mainnet.aptoslabs.com/v1/graphql";
const NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";

// Add this constant at the top of the file
export const POKECOIN_DECIMALS = 1000000; // 1 AptosInfoCoin = 1,000,000 units

/**
 * Check if a wallet has enough AptosInfoCoin balance using GraphQL
 */
export async function checkPokeCoinBalance(walletAddress: string): Promise<number> {
  try {
    console.log("Checking AptosInfoCoin balance for wallet:", walletAddress);
    
    // GraphQL query to get fungible asset balances
    const query = `
      query GetFungibleAssetBalances($address: String) {
        current_fungible_asset_balances(
          where: {owner_address: {_eq: $address}},
          limit: 100,
          order_by: {amount: desc}
        ) {
          asset_type
          amount
          __typename
        }
      }
    `;
    
    // Execute the GraphQL query
    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          address: walletAddress,
        },
      }),
    });
    
    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log("GraphQL response:", result);
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }
    
    // Find AptosInfoCoin in the balances
    const balances = result.data.current_fungible_asset_balances;
    console.log(`Found ${balances.length} fungible asset balances`);
    
    for (const balance of balances) {
      console.log(`Asset: ${balance.asset_type}, Amount: ${balance.amount}`);
      
      // Check if this is AptosInfoCoin by looking for the address in the asset_type
      if (balance.asset_type.includes(POKECOIN_ADDRESS)) {
        const rawAmount = parseInt(balance.amount);
        const infoCoins = rawAmount / POKECOIN_DECIMALS;
        console.log("Found AptosInfoCoin balance:", rawAmount, `(${infoCoins} AptosInfoCoin)`);
        return rawAmount;
      }
    }
    
    console.log("No AptosInfoCoin balance found");
    return 0;
  } catch (error) {
    console.error("Error checking AptosInfoCoin balance:", error);
    return 0;
  }
}

/**
 * Send 1 AptosInfoCoin from the user's wallet to the recipient address
 */
export async function sendPokeCoin(wallet: any): Promise<boolean> {
  try {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    console.log(`Attempting to send 1 AptosInfoCoin (${POKECOIN_DECIMALS} units) to ${RECIPIENT_ADDRESS}`);
    
    // Use the primary_fungible_store::transfer function with the correct type parameters
    const payload = {
      type: "entry_function_payload",
      function: "0x1::primary_fungible_store::transfer",
      type_arguments: [
        "0x1::object::ObjectCore" // T: key parameter
      ],
      arguments: [
        POKECOIN_ADDRESS,   // metadata: Object<T>
        RECIPIENT_ADDRESS,  // recipient: address
        POKECOIN_DECIMALS.toString() // amount: u64 - Send 1,000,000 units = 1 AptosInfoCoin
      ]
    };
    
    console.log("Submitting transaction with payload:", payload);
    
    // Sign and submit the transaction
    const transaction = await wallet.signAndSubmitTransaction(payload);
    
    console.log("Transaction submitted:", transaction);
    
    // Wait for transaction confirmation
    const client = new Types.Client("https://fullnode.mainnet.aptoslabs.com/v1");
    await client.waitForTransaction(transaction.hash);
    
    console.log("Successfully sent 1 AptosInfoCoin", transaction.hash);
    return true;
  } catch (error) {
    console.error("Error sending AptosInfoCoin:", error);
    
    // For development/testing, return success anyway if needed
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Returning success despite error");
      return true;
    }
    
    return false;
  }
}

/**
 * Alternative implementation to send 1 AptosInfoCoin
 */
export async function sendPokeCoinAlternative(wallet: any): Promise<boolean> {
  try {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    console.log(`Attempting to send 1 AptosInfoCoin (${POKECOIN_DECIMALS} units) using alternative method`);
    
    // Try with primary_fungible_store::transfer but a different type parameter
    const payload = {
      type: "entry_function_payload",
      function: "0x1::primary_fungible_store::transfer",
      type_arguments: [
        `${POKECOIN_ADDRESS}::fungible_asset::FungibleAsset` // Try a different type parameter
      ],
      arguments: [
        POKECOIN_ADDRESS,   // metadata: Object<T>
        RECIPIENT_ADDRESS,  // recipient: address
        POKECOIN_DECIMALS.toString() // amount: u64 - Send 1,000,000 units = 1 AptosInfoCoin
      ]
    };
    
    console.log("Submitting transaction with payload:", payload);
    
    // Sign and submit the transaction
    const transaction = await wallet.signAndSubmitTransaction(payload);
    
    console.log("Transaction submitted:", transaction);
    
    // Wait for transaction confirmation
    const client = new Types.Client("https://fullnode.mainnet.aptoslabs.com/v1");
    await client.waitForTransaction(transaction.hash);
    
    console.log("Successfully sent 1 AptosInfoCoin", transaction.hash);
    return true;
  } catch (error) {
    console.error("Error sending AptosInfoCoin:", error);
    
    // For development/testing, return success anyway if needed
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Returning success despite error");
      return true;
    }
    
    return false;
  }
}

/**
 * Try sending AptosInfoCoin using the standard coin transfer
 */
export async function sendPokeCoinUsingCoin(wallet: any): Promise<boolean> {
  try {
    if (!wallet) {
      throw new Error("Wallet not connected");
    }
    
    console.log(`Attempting to send 1 AptosInfoCoin (${POKECOIN_DECIMALS} units) using coin::transfer`);
    
    // Try with the standard coin transfer
    const payload = {
      type: "entry_function_payload",
      function: "0x1::coin::transfer",
      type_arguments: [
        `${POKECOIN_ADDRESS}::fungible_asset::PokeCoin` // Try a different type parameter
      ],
      arguments: [
        RECIPIENT_ADDRESS, // Recipient address
        POKECOIN_DECIMALS.toString() // amount: u64 - Send 1,000,000 units = 1 AptosInfoCoin
      ]
    };
    
    console.log("Submitting transaction with payload:", payload);
    
    // Sign and submit the transaction
    const transaction = await wallet.signAndSubmitTransaction(payload);
    
    console.log("Transaction submitted:", transaction);
    
    // Wait for transaction confirmation
    const client = new Types.Client("https://fullnode.mainnet.aptoslabs.com/v1");
    await client.waitForTransaction(transaction.hash);
    
    console.log("Successfully sent 1 AptosInfoCoin", transaction.hash);
    return true;
  } catch (error) {
    console.error("Error sending AptosInfoCoin:", error);
    
    // For development/testing, return success anyway if needed
    if (process.env.NODE_ENV === 'development') {
      console.log("Development mode: Returning success despite error");
      return true;
    }
    
    return false;
  }
}