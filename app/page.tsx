import { ChatWindow } from "@/components/ChatWindow";
import {
  AptosWalletProvider,
  WalletConnectButton,
} from "./components/AptosWalletConnector";

export default function Home() {
  const InfoCard = (
    <div className="p-4 md:p-8 rounded bg-[#25252d] w-full max-h-[85%] overflow-hidden">
      <h1 className="text-3xl md:text-4xl mb-4">
        MoveAgentKit + LangChain.js 🦜🔗 + Next.js
      </h1>
      <ul>
        <li className="text-l">
          🤝
          <span className="ml-2">
            This template showcases a simple agent chatbot using{" "}
            <a href="https://https://www.moveagentkit.xyz/">MoveAgentKit</a>
            {", "}
            <a href="https://js.langchain.com/" target="_blank">
              LangChain.js
            </a>{" "}
            and the Vercel{" "}
            <a href="https://sdk.vercel.ai/docs" target="_blank">
              AI SDK
            </a>{" "}
            in a{" "}
            <a href="https://nextjs.org/" target="_blank">
              Next.js
            </a>{" "}
            project.
          </span>
        </li>
        <li className="hidden text-l md:block">
          💻
          <span className="ml-2">
            You can find the prompt and model logic for this use-case in{" "}
            <code>app/api/chat/route.ts</code>.
          </span>
        </li>
        <li className="hidden text-l md:block">
          🎨
          <span className="ml-2">
            The main frontend logic is found in <code>app/page.tsx</code>.
          </span>
        </li>
        <li className="text-l">
          🐙
          <span className="ml-2">
            This template is open source - you can see the source code and
            deploy your own version{" "}
            <a href="#" target="_blank">
              from the GitHub repo (coming soon)
            </a>
            !
          </span>
        </li>
        <li className="text-l">
          👇
          <span className="ml-2">
            Try asking e.g. <code>What is my wallet address?</code> below!
          </span>
        </li>
      </ul>
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
