import styles from "../styles/NftCollectionSalesDisplay.module.css";
import { useState } from "react";
import { useEffect } from "react";


// Main component function
export default function NftCollectionSales({ chain, limit, collectionAddress }) {
  // Set up state variables
  const [isLoading, setIsloading] = useState(false);
  const [transactions, setTransactions] = useState();
  const [address, setAddress] = useState(collectionAddress);
  const [pageKey, setPageKey] = useState();

  // Function that handles Enter key press and initiates data fetching
  const returnHandler = async (e) => {
    if (e.keyCode === 13 && address) {
      setIsloading(true);
      await getNftSales();
      setIsloading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    if (address.length) {
      getNftSales();
    }
  }, []);

  // Function that fetches NFT sales data
  const getNftSales = async (pagekey) => {
    // Make a POST request to the server to fetch data
    const res = await fetch("/api/getNftCollectionSales", {
      method: "POST",
      body: JSON.stringify({
        // Replace with the smart contract address of the NFTs collection you're looking for
        contractAddress: address,
        chain: chain ? chain : "ETH_MAINNET",
        limit: limit ? limit : 100,
        pageKey: pagekey ? pagekey : null,
      }),
    }).then((transaction) => transaction.json());
    // If data is received successfully
    if (res.sales) {
      // If there are more pages to fetch
      if (pagekey) {
        // Add new transactions to the existing list of transactions
        setTransactions((prev) => {
          if (prev) return [...prev, ...res.sales];
          else return res.sales;
        });
      } else {
        // Replace the existing list of transactions with the new one
        setTransactions(res.sales);
      }
      // If there is a new page key, update the state variable
      if (res.pageKey && res.pageKey.length != pagekey) {
        setPageKey(res.pageKey);
      } else {
        setPageKey(null);
      }
    } else {
      // If no data is received, set state variables to null
      setPageKey();
      setTransactions();
    }
  };
  return (
    <div className={styles.tx_history_container}>
      <div className={styles.transaction_search_container}>
        <img
          onClick={() => {
            getNftSales();
          }}
          className={styles.search_icon}
          src="https://static.alchemyapi.io/images/cw3d/Icon%20Medium/search-01-m.svg"
        ></img>
        <input
          className={styles.input}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Collection's contract address"
          onKeyDown={returnHandler}
        />
      </div>
      <div className={styles.table_container}>
        <div className={styles.table}>
          {isLoading ? (
            <div className={styles.warning}>Loading...</div>
          ) : !transactions?.length ? (
            <div className={styles.warning}>
              No transactions with this address
            </div>
          ) : null}
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>ITEM</span>
            </div>
            <hr />
            {transactions &&
              transactions?.map((tx, i) => {
                return (
                  <div key={i} className={styles.row}>
                    #{tx.tokenId}
                  </div>
                );
              })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>PRICE</span>
            </div>
            <hr />
            {transactions &&
              transactions?.map((tx, i) => {
                return (
                  <div key={i} className={styles.row}>
                    <span className={styles.price}>{tx.sellerFee} ETH</span>
                  </div>
                );
              })}
          </div>
          <div className={styles.column}>
            <div className={styles.row}>
              <span className={styles.title}>FROM</span>
            </div>
            <hr />
            {transactions &&
              transactions?.map((tx, i) => {
                return (
                  <div key={i} className={styles.row}>
                    <span className={styles.blue_text}>
                      {tx.sellerAddress.slice(0, 6)}...
                      {tx.sellerAddress.slice(6, 10)}
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
            {transactions &&
              transactions?.map((tx, i) => {
                return (
                  <div key={i} className={styles.row}>
                    <span className={styles.blue_text}>
                      {tx.buyerAddress.slice(0, 6)}...
                      {tx.buyerAddress.slice(6, 10)}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
      <button
        className={
          isLoading || !pageKey
            ? styles.button_unclicked
            : styles.button_clicked
        }
        onClick={() => {
          getNftSales(pageKey);
        }}
        disabled={!pageKey || isLoading}
      >
        next
      </button>
    </div>
  );
}
