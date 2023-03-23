// import necessary modules
import styles from "../styles/NftCollectionInfo.module.css";
import { useEffect, useState } from "react";

// define component function that receives collectionAddress prop
export default function NFTCollectionInfo({ collectionAddress }) {
  // initialize state for loading state and collection data
  const [isLoading, setIsLoading] = useState(false);
  const [collection, setCollection] = useState();

  // define async function to fetch collection data
  const getCollection = async () => {
    setIsLoading(true);
    // make POST request to server to fetch collection metadata
    const collection = await fetch("/api/getNftContractMetadata", {
      method: "POST",
      body: JSON.stringify({
        // pass the collectionAddress prop as a parameter
        address: collectionAddress,
      }),
    }).then((data) => data.json());
    setCollection(collection);
    setIsLoading(false);
  };

  // useEffect hook to fetch collection data when component mounts
  useEffect(() => {
    getCollection();
  }, []);

  // if loading state is true, display a loading message
  if (isLoading) return <p>Loading...</p>;

  // render the collection data
  return (
    <div className={styles.collection_container}>
      <div className={styles.header}>
        <img src={collection?.imageUrl} className={styles.image}></img>
        <div>
          <h2 className={styles.collection_name}>
            {collection?.name}
            {collection?.verified ? (
              <img
                className={styles.verified_icon}
                src={
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Twitter_Verified_Badge.svg/2048px-Twitter_Verified_Badge.svg.png"
                }
              />
            ) : null}
          </h2>
          <h4 className={styles.company_name}>{collection?.symbol}</h4>
        </div>
        <div className={styles.socials_container}>
          {collection?.twitter_username /* if the collection has a Twitter username, display a Twitter icon linking to the Twitter page */ ? (
            <a
              href={"https://twitter.com/" + collection?.twitter_username}
              target="_blank"
              rel="noreferrer"
            >
              <img
                src={
                  "https://help.twitter.com/content/dam/help-twitter/brand/logo.png"
                }
                alt="t"
                className={styles.twitter_icon}
              />
            </a>
          ) : null}
          {collection?.discord_url /* if the collection has a Discord URL, display a Discord icon linking to the Discord page */ ? (
            <a href={collection?.discord_url} target="_blank" rel="noreferrer">
              <img
                src={
                  "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
                }
                alt="d"
                className={styles.discord_icon}
              />
            </a>
          ) : null}
        </div>
      </div>
      <div className={styles.description}>
        {collection?.description.split("\n").map((item, key) => {
          // display the collection description, parsing any URLs as clickable links
          const regex = /(https?:\/\/[^\s]+)/g;
          if (regex.test(item)) {
            return (
              <p key={key}>
                {item.split(regex).map((text, index) => {
                  if (regex.test(text)) {
                    return (
                      <a
                        className={styles.link}
                        href={text}
                        key={index}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {text}
                      </a>
                    );
                  } else return <>{text}</>;
                })}
                <br />
              </p>
            );
          } else {
            return (
              <p key={key}>
                {item}
                <br />
              </p>
            );
          }
        })}
      </div>
      <div className={styles.data_container}>
        <div className={styles.data_point_container}>
          <h3 className={styles.data_title}>FLOOR</h3>
          <h1 className={styles.data_point}>{collection?.floorPrice} ETH</h1>
        </div>
        <div className={styles.data_point_container}>
          <h3 className={styles.data_title}>TOTAL SUPPLY</h3>
          <h1 className={styles.data_point}>{collection?.totalSupply}</h1>
        </div>
      </div>
    </div>
  );
}
