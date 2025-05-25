import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useContext, useState } from "react";

const GifContext = createContext();

export const useGif = () => {
  const context = useContext(GifContext);
  if (!context) {
    throw new Error("useGif must be used within a gifProvider");
  }
  return context;
}

const GifProvider = ({ children }) => {

  const giphy = new GiphyFetch(import.meta.env.VITE_GIPHY_KEY);

  const [gifs, setGifs] = useState([]);
  const [filter, setFilter] = useState("gifs");
  const [favourite, setFavourite] = useState([]);

  return (
    <GifContext.Provider value={{ giphy, gifs, setGifs, filter, setFilter, favourite }}>
      {children}
    </GifContext.Provider>
  )
}

export default GifProvider;