// Before using this API endpoint, make sure to run npm install FormData formidable or yarn install FormData formidable.
import FormData from "form-data";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Check if request method is POST
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  // Parse the incoming form data
  const data = await new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject({ err });
      resolve({ files });
    });
  });

  // Check if an image was uploaded
  const image = data.files.image;
  if (image) {
    try {
      // Create a new form data object
      const formData = new FormData();
      // Append the image file to the form data object
      formData.append("file", fs.createReadStream(image.filepath));

      // Create a metadata object for the image
      const metadata = JSON.stringify({
        name: "File name",
      });
      // Append the metadata object to the form data object
      formData.append("pinataMetadata", metadata);

      // Create an options object for the image
      const options = JSON.stringify({
        cidVersion: 0,
      });
      // Append the options object to the form data object
      formData.append("pinataOptions", options);

      // Send a POST request to pin the file to IPFS using Pinata API
      const cid = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          body: formData,
          headers: {
            // Pass in authorization token to access Pinata API
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
        }
      )
        .then((res) => res.json())
        .then((res) => {
          return res.IpfsHash;
        });

      // Return the file URL for the pinned image
      res
        .status(200)
        .send({ fileURL: `https://gateway.pinata.cloud/ipfs/${cid}` });
    } catch (e) {
      console.log(e);
      res.status(500).send({
        message: "something went wrong, check the log in your terminal",
      });
    }
  } else {
    console.warn("No image uploaded");
    res.status(403).send({
      message: "No image uploaded",
    });
  }
}
