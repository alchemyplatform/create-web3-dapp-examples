import { Alchemy, Network, NftSaleMarketplace } from "alchemy-sdk";

// Exported function handling the POST request
export default async function handler(req, res) {
  // Extracting data from the request body
  const { contractAddress, chain, limit, pageKey } = JSON.parse(req.body);

  // Check if the method is not POST
  if (req.method !== "POST") {
    // Respond with status 405 Method Not Allowed and a message
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  // Setting up the Alchemy API key and network
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network[chain],
  };
  // Creating an instance of the Alchemy client with the settings
  const alchemy = new Alchemy(settings);

  try {
    // Retrieving NFT sales from the Alchemy API
    const sales = await alchemy.nft.getNftSales({
      marketplace: NftSaleMarketplace.SEAPORT,
      contractAddress: contractAddress,
      limit: limit,
      pageKey: pageKey ? pageKey : null,
    });
    // Formatting the sales data
    const formattedSales = sales.nftSales.map((NFT) => {
      const { tokenId, quantity, buyerAddress, sellerAddress, sellerFee } = NFT;
      return {
        tokenId,
        quantity,
        buyerAddress,
        sellerAddress,
        // Converting the seller fee amount to the correct format
        sellerFee:
          parseInt(sellerFee.amount) / Math.pow(10, sellerFee.decimals),
        tokenSymbol: sellerFee.symbol,
      };
    });

    // Responding with the formatted sales data and the page key (if any)
    res.status(200).json({
      sales: formattedSales,
      pageKey: sales.pageKey,
    });
    // Rest of the code
  } catch (e) {
    // Catching any errors and responding with status 500 Internal Server Error and a message
    console.warn(e);
    res.status(500).send({
      message: "something went wrong, check the log in your terminal",
    });
  }
}
