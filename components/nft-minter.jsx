// Import CSS styles, and necessary modules from packages
import styles from "../styles/NftMinter.module.css";
import { Contract } from "alchemy-sdk";
import { useState } from "react";
import { useAccount, useSigner } from "wagmi";

// NFT Minter component
export default function NftMinter({ contractAddress, tokenUri, abi }) {
  // Get the user's wallet address and status of their connection to it
  const { address, isDisconnected } = useAccount();
  // Get the signer instance for the connected wallet
  const { data: signer } = useSigner();
  // State hooks to track the transaction hash and whether or not the NFT is being minted
  const [txHash, setTxHash] = useState();
  const [isMinting, setIsMinting] = useState(false);

  // Function to mint a new NFT
  const mintNFT = async () => {
    // Create a new instance of the NFT contract using the contract address and ABI
    const nftContract = new Contract(contractAddress, abi, signer);
    try {
      // Set isMinting to true to show that the transaction is being processed
      setIsMinting(true);
      // Call the smart contract function to mint a new NFT with the provided token URI and the user's address
      const mintTx = await nftContract.safeMint(tokenUri, address);
      // Set the transaction hash in state to display in the UI
      setTxHash(mintTx?.hash);
      // Wait for the transaction to be processed
      await mintTx.wait();
      // Reset isMinting and txHash in state
      setIsMinting(false);
      setTxHash(null);
    } catch (e) {
      // If an error occurs, log it to the console and reset isMinting to false
      console.log(e);
      setIsMinting(false);
    }
  };
  return (
    <div className={styles.page_flexBox}>
      <div className={styles.page_container}>
        <div className={styles.nft_media_container}>
          <video className={styles.nft_media} autoPlay="true">
            <source src="/static/cw3d-nft-v2.mp4" type="video/mp4" />
          </video>
        </div>

        <div className={styles.nft_info}>
          <h1 className={styles.nft_title}>Create Web3 Dapp NFT</h1>
          <h3 className={styles.nft_author}>By Alchemy.eth</h3>
          <p className={styles.text}>
            Bootstrap a full stack dapp in 5 minutes with customizable
            components and project templates using Create Web3 Dapp.
          </p>
          <hr className={styles.break} />
          <h3 className={styles.nft_instructions_title}>INSTRUCTIONS</h3>
          <p className={styles.text}>
            This NFT is on MATIC Mumbai. You’ll need some test MATIC to mint the
            NFT. <a href="https://mumbaifaucet.com/">Get free test MATIC</a>
          </p>
          {isDisconnected ? (
            <p>Connect your wallet to get started</p>
          ) : !txHash ? (
            <button
              className={`${styles.button} ${
                isMinting && `${styles.isMinting}`
              }`}
              disabled={isMinting}
              onClick={async () => await mintNFT()}
            >
              {isMinting ? "Minting" : "Mint Now"}
            </button>
          ) : (
            <div>
              <h3 className={styles.attribute_input_label}>TX ADDRESS</h3>
              <a
                href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className={styles.address_container}>
                  <div>
                    {txHash.slice(0, 6)}...{txHash.slice(6, 10)}
                  </div>
                  <img
                    src={
                      "https://static.alchemyapi.io/images/cw3d/Icon%20Large/etherscan-l.svg"
                    }
                    width="20px"
                    height="20px"
                  />
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
