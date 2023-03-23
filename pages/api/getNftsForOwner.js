// Importing required libraries from alchemy-sdk
import { Network, Alchemy, NftFilters } from "alchemy-sdk";

export default async function handler(req, res) {
  // Parsing the required data from the request body
  const { address, pageSize, chain, excludeFilter, pageKey } = JSON.parse(
    req.body
  );
  console.log(chain);

  // Handling only POST requests
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  // Setting the API key and network for the Alchemy SDK
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network[chain],
  };
  const alchemy = new Alchemy(settings);

  try {
    // Fetching the NFTs for an owner with the Alchemy SDK
    const nfts = await alchemy.nft.getNftsForOwner(address, {
      pageSize: pageSize ? pageSize : 100,
      excludeFilters: excludeFilter && [NftFilters.SPAM],
      pageKey: pageKey ? pageKey : "",
    });

    // Formatting the fetched NFTs to the desired format
    const formattedNfts = nfts.ownedNfts.map((nft) => {
      const { contract, title, tokenType, tokenId, description, media } = nft;

      return {
        contract: contract.address,
        symbol: contract.symbol,
        collectionName: contract.openSea?.collectionName,
        media: media[0]?.gateway
          ? media[0]?.gateway
          : "https://via.placeholder.com/500",
        format: media[0]?.format,
        verified: contract.openSea?.safelistRequestStatus,
        tokenType,
        tokenId,
        title,
        description,
      };
    });

    // Sending the formatted NFTs and page key as a JSON response
    res.status(200).json({ nfts: formattedNfts, pageKey: nfts.pageKey });
  } catch (e) {
    // Logging the error and sending a response with an error message
    console.warn(e);
    res.status(500).send({
      message: "something went wrong, check the log in your terminal",
    });
  }
}
