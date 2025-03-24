import { ChatWindow } from "@/components/ChatWindow";
import {
  AptosWalletProvider,
  WalletConnectButton,
} from "./components/AptosWalletConnector";

export default function Home() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">Aptos Poke Chatbot</h1>
      <h2>1 prompt = 1 PokeCoin</h2>
    </div>
  );
  return (
    <AptosWalletProvider>
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <div className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit">
            <div className="flex items-center justify-between w-full max-w-5xl px-4">
              <p className="font-bold">
                MoveAgentKit + LangChain.js 🦜️🔗 + Next.js
              </p>
              <WalletConnectButton />
            </div>
          </div>

          <ChatWindow
            endpoint="api/hello"
            emoji="🤖"
            titleText="Aptos agent"
            placeholder="I'm your friendly Aptos agent! Ask me anything..."
            emptyStateComponent={InfoCard}
          ></ChatWindow>
        </div>
      </main>
    </AptosWalletProvider>
  );
}
