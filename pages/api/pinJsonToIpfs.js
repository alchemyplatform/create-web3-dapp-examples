

// define handler function
export default async function handler(
  req,
  res
) {
  // parse metadata from request body
  const metadata = JSON.parse(req.body);

  // check that method is POST
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  try {
    // pin metadata to IPFS using Pinata API
    const cid = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      body: JSON.stringify(metadata),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
    })
      .then((res) => res.json())
      .then((res) => {
        return res.IpfsHash;
      });

    // send metadata URL in response
    res
      .status(200)
      .send({ metadataURL: `https://gateway.pinata.cloud/ipfs/${cid}` });
  } catch (e) {
    // handle errors
    console.warn(e);
    res.status(500).send({
      message: "something went wrong, check the log in your terminal",
    });
  }
}
