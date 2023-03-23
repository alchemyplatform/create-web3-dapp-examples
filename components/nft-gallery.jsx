// Importing necessary modules and components
import styles from "../styles/NftGallery.module.css";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

// Defining the main component of the NFT gallery
export default function NftGallery({
  walletAddress,
  collectionAddress,
  chain,
  pageSize,
}) {
  // Defining states for the component
  const [nfts, setNfts] = useState();
  const [isLoading, setIsloading] = useState(false);
  const { address, isConnected, isDisconnected } = useAccount();
  const [pageKey, setPageKey] = useState();
  const [excludeFilter, setExcludeFilter] = useState(true);

  // Defining functions for fetching NFTs
  const fetchNfts = async () => {
    setIsloading(true);
    if (address || walletAddress) {
      await getNftsForOwner();
    } else if (collectionAddress) {
      await getNftsForCollection();
    }
    setIsloading(false);
  };
  const getNftsForOwner = async () => {
    if (isConnected || walletAddress) {
      try {
        // Making a POST request to the server to get NFTs
        const res = await fetch("/api/getNftsForOwner", {
          method: "POST",
          body: JSON.stringify({
            address: isDisconnected ? walletAddress : address,
            pageSize: pageSize ? pageSize : 100,
            chain: chain ? chain : "ETH_MAINNET",
            pageKey: pageKey ? pageKey : null,
            excludeFilter: excludeFilter,
          }),
        }).then((res) => res.json());
        setNfts(res.nfts);
        if (res.pageKey) setPageKey(res.pageKey);
      } catch (e) {
        console.log(e);
      }
    }
  };

  // Defining useEffect hooks for fetching NFTs and updating when the wallet address changes
  useEffect(() => {
    if (address?.length) fetchNfts();
  }, [address]);
  const getNftsForCollection = async () => {
    if (collectionAddress) {
      try {
        // Making a POST request to the server to get NFTs
        const res = await fetch("/api/getNftsForCollection", {
          method: "POST",
          body: JSON.stringify({
            address: collectionAddress,
            pageSize: pageSize,
            chain: chain,
            pageKey: pageKey ? pageKey : null,
            excludeFilter: excludeFilter,
          }),
        }).then((res) => res.json());
        setNfts(res.nfts);
        if (res.pageKey) setPageKey(res.pageKey);
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    // Calling fetchNfts on component mount
    fetchNfts();
  }, []);

  // If user is disconnected, display a message to connect wallet to get started
  if (isDisconnected)
    return (
      <div className={styles.nft_gallery_page_container}>
        <p>Connect your wallet to get started</p>
      </div>
    );

  // If data is still loading, display a loading message
  if (isLoading)
    return (
      <div className={styles.nft_gallery_page_container}>
        <p>Loading</p>
      </div>
    );

  // Once data is loaded, display NFT gallery
  return (
    <div className={styles.nft_gallery_page_container}>
      <div className={styles.nft_gallery}>
        <div className={styles.nfts_display}>
          {nfts?.length ? (
            nfts.map((nft) => {
              return <NftCard key={nft.tokenId} nft={nft} />;
            })
          ) : (
            <p>No NFTs found for the selected address</p>
          )}
        </div>
      </div>

      {pageKey && (
        <div className={styles.button_container}>
          <a
            className={styles.button_black}
            onClick={() => {
              fetchNFTs(pageKey);
            }}
          >
            Load more
          </a>
        </div>
      )}
    </div>
  );
}

function NftCard({ nft }) {
  return (
    <div className={styles.card_container}>
      <div className={styles.image_container}>
        {nft.format == ".mp4" ? (
          <video>
            <source></source>
          </video>
        ) : (
          <img src={nft.media}></img>
        )}
      </div>
      <div className={styles.info_container}>
        <div className={styles.title_container}>
          <h3>
            {nft.title.length > 20
              ? `${nft.title.substring(0, 15)}...`
              : nft.title}
          </h3>
        </div>
        <hr className={styles.separator} />
        <div className={styles.symbol_contract_container}>
          <div className={styles.symbol_container}>
            <p>
              {nft.collectionName && nft.collectionName.length > 20
                ? `${nft.collectionName.substring(0, 20)}`
                : nft.collectionName}
            </p>

            {nft.verified == "verified" ? (
              <img
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                }
                width="20px"
                height="20px"
              />
            ) : null}
          </div>
          <div className={styles.contract_container}>
            <p className={styles.contract_container}>
              {nft.contract.slice(0, 6)}...{nft.contract.slice(38)}
            </p>
            <img
              src={
                "https://etherscan.io/images/brandassets/etherscan-logo-circle.svg"
              }
              width="15px"
              height="15px"
            />
          </div>
        </div>

        <div className={styles.description_container}>
          <p>{nft.description}</p>
        </div>
      </div>
    </div>
  );
}
