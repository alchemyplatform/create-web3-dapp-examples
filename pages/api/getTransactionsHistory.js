import {
  Network,
  Alchemy,
  AssetTransfersCategory,
  SortingOrder,
} from "alchemy-sdk";

export default async function handler(
 req,res
) {
  // Get data from request body
  const {
    address,
    chain,
    incomingAssetTransferPageKey,
    outgoingAssetTransferPageKey,
    limit,
  } = JSON.parse(req.body);

  // Only allow POST requests
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  // Set Alchemy settings based on the chain
  const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network[chain],
  };

  const alchemy = new Alchemy(settings);

  try {
    // Get outgoing asset transfers for the specified address
    const outgoingAssetTransfer = await alchemy.core.getAssetTransfers({
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC1155,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
      ],
      fromAddress: address,
      order: SortingOrder.DESCENDING,
      maxCount: limit ? limit : 100,
      excludeZeroValue: true,
      withMetadata: true,
      pageKey: outgoingAssetTransferPageKey
        ? outgoingAssetTransferPageKey
        : undefined,
    });

    // Get incoming asset transfers for the specified address
    const incomingAssetTransfer = await alchemy.core.getAssetTransfers({
      category: [
        AssetTransfersCategory.EXTERNAL,
        AssetTransfersCategory.INTERNAL,
        AssetTransfersCategory.ERC1155,
        AssetTransfersCategory.ERC20,
        AssetTransfersCategory.ERC721,
      ],
      toAddress: address,
      order: SortingOrder.DESCENDING,
      maxCount: limit ? limit : 100,
      excludeZeroValue: true,
      withMetadata: true,
      pageKey: incomingAssetTransferPageKey
        ? incomingAssetTransferPageKey
        : undefined,
    });

    // Filter out outgoing asset transfers with value equal to 0
    const filteredOutGoingAssetTransfer =
      outgoingAssetTransfer.transfers.filter(
        (assetTransfer) => assetTransfer.value && assetTransfer.value > 0
      );

    // Filter incoming asset transfers with value equal to 0
    const filteredIncomingAssetTransfer =
      incomingAssetTransfer.transfers.filter(
        (assetTransfer) => assetTransfer.value
      );

    // Add metadata to the outgoing asset transfers and structure them
    const structuredOutgoingAssetTransfer = await Promise.all(
      filteredOutGoingAssetTransfer.map(async (assetTransfer) => {
        let tokenMetadata;
        try {
          tokenMetadata = await alchemy.core.getTokenMetadata(
            assetTransfer.rawContract.address
          );
        } catch (e) {}

        return {
          from: assetTransfer.from,
          to: assetTransfer.to,
          value: assetTransfer.value,
          asset: assetTransfer.asset,
          hash: assetTransfer.hash,
          logo: tokenMetadata ? tokenMetadata.logo : null,
          timestamp: assetTransfer.metadata.blockTimestamp,
          category: assetTransfer.category,
        };
      })
    );

    // Add metadata to the incoming asset transfers and structure them
    const structuredIncomingAssetTransfer = await Promise.all(
      filteredIncomingAssetTransfer.map(async (assetTransfer) => {
        let tokenMetadata;
        try {
          tokenMetadata = await alchemy.core.getTokenMetadata(
            assetTransfer.rawContract.address
          );
        } catch (e) {}

        return {
          from: assetTransfer.from,
          to: assetTransfer.to,
          value: assetTransfer.value,
          asset: assetTransfer.asset,
          hash: assetTransfer.hash,
          logo: tokenMetadata ? tokenMetadata.logo : null,
          timestamp: assetTransfer.metadata.blockTimestamp,
          category: assetTransfer.category,
        };
      })
    );

    res.status(200).json({
      incomingTransactionsHistory: structuredIncomingAssetTransfer,
      outgoingTransactionsHistory: structuredOutgoingAssetTransfer,
      incomingAssetTransferPageKey: incomingAssetTransfer.pageKey
        ? incomingAssetTransfer.pageKey
        : null,
      outgoingAssetTransferPageKey: outgoingAssetTransfer.pageKey
        ? outgoingAssetTransfer.pageKey
        : null,
    });
  } catch (e) {
    console.warn(e);
    res.status(500).send({
      message: "something went wrong, check the log in your terminal",
    });
  }
}
