import styles from "../styles/TransactionsHistoryDisplay.module.css";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function TransactionHistory({ walletAddress, chain, limit }) {
  const [isLoading, setIsloading] = useState(false);
  const [outgoingTransactionsHistory, setOutgoingTransactionsHistory] =
    useState();
  const [incomingTransactionsHistory, setIncomingTransactionsHistory] =
    useState();
  const [isIncomingTransactionsView, setIsIncomingTransactionsView] =
    useState(true);
  const [outgoingAssetTransferPageKey, setOutgoingAssetTransferPageKey] =
    useState();
  const [incomingAssetTransferPageKey, setIncomingAssetTransferPageKey] =
    useState();

  // This avoids Next.js dehydration
  const [myAddress, setMyAddress] = useState();
  const { address, isDisconnected, isConnected } = useAccount();

  const getTransactionHistory = async () => {
    setIsloading(true);
    if (isConnected || walletAddress) {
      const transactions = await fetch("/api/getTransactionsHistory", {
        method: "POST",
        body: JSON.stringify({
          // Replace with the smart contract address of the NFTs collection you're looking for
          address: isDisconnected ? walletAddress : myAddress,
          chain: chain ? chain : "ETH_MAINNET",
          incomingAssetTransferPageKey: incomingAssetTransferPageKey
            ? incomingAssetTransferPageKey
            : null,
          outgoingAssetTransferPageKey: outgoingAssetTransferPageKey
            ? outgoingAssetTransferPageKey
            : null,
          limit: limit ? limit : 100,
        }),
      });
      const res = await transactions.json();

      if (res.incomingTransactionsHistory?.length) {
        if (incomingAssetTransferPageKey) {
          setIncomingTransactionsHistory((prev) => {
            if (prev) return [...prev, ...res.incomingTransactionsHistory];
          });
        } else {
          setIncomingTransactionsHistory(res.incomingTransactionsHistory);
        }
        if (res.incomingAssetTransferPageKey?.length) {
          setIncomingAssetTransferPageKey(res.incomingAssetTransferPageKey);
        } else {
          setIncomingAssetTransferPageKey();
        }
      }
      if (res.outgoingTransactionsHistory?.length) {
        if (outgoingAssetTransferPageKey) {
          setOutgoingTransactionsHistory((prev) => {
            if (prev) return [...prev, ...res.outgoingTransactionsHistory];
          });
        } else {
          setOutgoingTransactionsHistory(res.outgoingTransactionsHistory);
        }
        if (res.outgoingAssetTransferPageKey?.length) {
          setOutgoingAssetTransferPageKey(res.outgoingAssetTransferPageKey);
        } else {
          setOutgoingAssetTransferPageKey();
        }
      }
      setIsloading(false);
    }
  };

  // This hook is used for fetching the transaction history once the user's wallet address is available
  useEffect(() => {
    if (myAddress?.length) getTransactionHistory();
  }, [myAddress]);

  // This hook is used for setting the user's wallet address once it is available from the props
  useEffect(() => {
    if (walletAddress?.length) setMyAddress(walletAddress);
  }, [walletAddress]);

  // This hook is used for setting the user's wallet address once it is available from wallet connect
  useEffect(() => {
    if (address?.length && isConnected) setMyAddress(address);
  }, [address]);

  return (
    <div className={styles.tx_history_container}>
      <div className={styles.header_container}>
        <div className={styles.name}>
          {myAddress?.slice(0, 6) +
            "..." +
            myAddress?.slice(myAddress.length - 4)}
        </div>
        <div className={styles.tab_group}>
          <button
            className={
              !isIncomingTransactionsView
                ? styles.button_clicked
                : styles.button_unclicked
            }
            value={"send"}
            onClick={() => setIsIncomingTransactionsView(false)}
          >
            Sent
          </button>
          <button
            className={
              isIncomingTransactionsView
                ? styles.button_clicked
                : styles.button_unclicked
            }
            value={"receive"}
            onClick={() => setIsIncomingTransactionsView(true)}
          >
            Received
          </button>
        </div>
      </div>

      <div className={styles.table_container}>
        <div className={styles.table}>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>TX HASH</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              return (
                <div key={i} className={styles.row}>
                  <span className={styles.blue_text}>
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(6, 10)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>FROM</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              return (
                <div key={i} className={styles.row}>
                  <span className={styles.blue_text}>
                    {tx.from.slice(0, 6)}...{tx.from.slice(tx.from.length - 4)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>TO</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              return (
                <div key={i} className={styles.row}>
                  <span className={styles.blue_text}>
                    {tx.to.slice(0, 6)}...{tx.to.slice(tx.to.length - 4)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>DATE TIME (UTC)</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              const newDateStr = new Date(tx.timestamp)
                .toISOString()
                .replace("T", " ")
                .slice(0, -5);
              return (
                <div key={i} className={styles.row}>
                  {newDateStr}
                </div>
              );
            })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>TOKEN TYPE</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              return (
                <div key={i} className={styles.row}>
                  {tx.category}
                </div>
              );
            })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>VALUE</span>
            </div>
            <hr />
            {(isIncomingTransactionsView
              ? incomingTransactionsHistory
              : outgoingTransactionsHistory
            )?.map((tx, i) => {
              return (
                <div key={i} className={styles.row}>
                  {Math.round(tx.value * 100) / 100} {tx.asset}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {outgoingAssetTransferPageKey && (
        <button
          className={
            isLoading ||
            (isIncomingTransactionsView && !incomingAssetTransferPageKey) ||
            (!isIncomingTransactionsView && !outgoingAssetTransferPageKey)
              ? styles.load_button_disabled
              : styles.load_button
          }
          disabled={
            isLoading ||
            (isIncomingTransactionsView && !incomingAssetTransferPageKey) ||
            (!isIncomingTransactionsView && !outgoingAssetTransferPageKey)
          }
          onClick={() => {
            getTransactionHistory();
          }}
        >
          Load more
        </button>
      )}
    </div>
  );
}
