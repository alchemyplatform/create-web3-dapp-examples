import styles from "../styles/Home.module.css";
import NFTCollectionInfo from "../components/nft-collection-info-display";
import NftCreator from "../components/nft-creator";
import contract from "../abi/CreateWeb3DappNFT.json";
import NftMinter from "../components/nft-minter";
import TokensBalancePanel from "../components/tokens-balance-display";
import NftGallery from "../components/nft-gallery";
import TransactionHistory from "../components/transactions-history-display";
import NftCollectionSales from "../components/nft-collection-sales-display";

export default function Home() {
  return (
    <div>
      <main className={styles.main}>
        <NftMinter
          contractAddress={"0x9FaCAf075Cda7C0947DA0F0B4164332e01422E97"}
          tokenUri={
            "https://ipfs.filebase.io/ipfs/QmcZMwBfYwRfysPyLaJzMk5RwsgXnVz7JDkbh6eRbAfSjJ/QmdeEmVuLKxhy63CfLkt193sYTRHLLCH6qzyghBS27k7uJ"
          }
          abi={contract.abi}
        />
        <NftCreator
          abi={contract.abi}
          contractAddress={"0x9FaCAf075Cda7C0947DA0F0B4164332e01422E97"}
        />
        <NftGallery
          collectionAddress={"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"}
          chain={"ETH_MAINNET"}
        ></NftGallery>
        <TokensBalancePanel chain={"ETH_MAINNET"} />
        <NFTCollectionInfo
          collectionAddress={"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"}
        />
        <TransactionHistory walletAddress={"vitalik.eth"} />
        <NftCollectionSales
          collectionAddress={"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"}
        />
      </main>
    </div>
  );
}
