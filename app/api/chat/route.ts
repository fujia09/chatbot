import { NextRequest, NextResponse } from "next/server";
import { MoveAgentKit } from "move-agent-kit";
import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: NextRequest) {
  try {
    const { messages, walletAddress } = await req.json();
    
    console.log("=== API WALLET INFO ===");
    console.log("Received wallet address:", walletAddress);
    console.log("Using private key fallback:", !walletAddress);
    
    // If no wallet address is provided, fall back to using the private key from env
    const usePrivateKey = !walletAddress;
    
    // Create a new agent using either the connected wallet address or private key
    const agent = new MoveAgentKit({
      network: "testnet", // or "mainnet" based on your needs
      ...(usePrivateKey 
        ? { privateKey: process.env.APTOS_PRIVATE_KEY } 
        : { walletAddress: walletAddress })
    });
    
    // Log the agent configuration (without exposing private keys)
    console.log("Agent network:", agent.network);
    console.log("Agent using wallet address:", walletAddress || "Using private key instead");
    
    // Get the last user message
    const lastUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
    
    // Create a prompt template with information about the wallet
    const systemPrompt = `You are a helpful assistant for Aptos blockchain. 
    ${walletAddress ? `The user's wallet address is: ${walletAddress}` : ""}
    When asked about wallet information, use this address.`;
    
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt],
      ["human", "{input}"]
    ]);
    
    // Use Anthropic or OpenAI model
    const model = process.env.ANTHROPIC_API_KEY 
      ? new ChatAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      : new ChatOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Create a chain
    const chain = prompt.pipe(model).pipe(new StringOutputParser());
    
    // Invoke the chain
    const response = await chain.invoke({
      input: lastUserMessage,
    });
    
    return NextResponse.json({ content: response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "There was an error processing your request" },
      { status: 500 }
    );
  }
} 