import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import styles from "../styles/TokensBalanceDisplay.module.css";

// Define TokensBalancePanel component
export default function TokensBalancePanel({ walletAddress, chain }) {
  // Define state variables using the useState hook
  const [tokensBalance, setTokensBalance] = useState();
  const [isLoading, setIsloading] = useState(false);
  const [myAddress, setMyAddress] = useState();

  // Get current address and connection status from useAccount hook
  const { address, isConnected, isDisconnected } = useAccount();

  // Define function to get token balances
  const getBalance = async () => {
    setIsloading(true);
    if (!isDisconnected || walletAddress) {
      try {
        const fetchedTokensBalance = await fetch("/api/getTokensBalance", {
          method: "POST",
          body: JSON.stringify({
            address: isDisconnected ? walletAddress : address,
            chain: chain,
          }),
        }).then((res) => res.json());
        setTokensBalance(fetchedTokensBalance);
      } catch (e) {
        console.log(e);
      }
    }
    setIsloading(false);
  };

  // Fetch token balances when myAddress changes
  useEffect(() => {
    if (address?.length) getBalance();
  }, [myAddress]);

  useEffect(() => {
    if (walletAddress?.length) setMyAddress(walletAddress);
  }, [walletAddress]);

  useEffect(() => {
    if (address?.length) setMyAddress(address);
  }, [address]);

  // If neither walletAddress nor address are provided, return "No address"
  if (!walletAddress && isDisconnected) return "No address";

  // Render TokensBalancePanel component
  return (
    <div className={styles.token_panel_container}>
      <div className={styles.tokens_box}>
        <div className={styles.header}>
          {myAddress?.slice(0, 6)}...{myAddress?.slice(myAddress.length - 4)}
        </div>
        {isLoading
          ? "Loading..."
          : tokensBalance?.length &&
            tokensBalance?.map((token, i) => {
              const convertedBalance = Math.round(token.balance * 100) / 100;
              return (
                <div key={i} className={styles.token_container}>
                  <div className={styles.token_name}>
                    {token.logo ? (
                      <img
                        className={styles.image_container}
                        src={token.logo}
                        alt={""}
                      ></img>
                    ) : (
                      <div className={styles.image_placeholder_container}></div>
                    )}
                    <div className={styles.coin_name}>{token.name}</div>
                  </div>
                  <div className={styles.token_info}>
                    <div className={styles.price}>{convertedBalance}</div>
                    <div className={styles.coin_symbol}>{token.symbol}</div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
