import { POKECOIN_DECIMALS } from "../utils/pokeUtils";

// In your component
const formatPokeCoinBalance = (rawBalance: number) => {
  return (rawBalance / POKECOIN_DECIMALS).toFixed(2);
};

// In your render method
return (
  <div className="wallet-display">
    {connected ? (
      <>
        <span className="address">{shortenAddress(account?.address)}</span>
        <span className="balance">
          {formatPokeCoinBalance(balance)} PokeCoin
        </span>
      </>
    ) : (
      <button onClick={connectWallet}>Connect Wallet</button>
    )}
  </div>
);
