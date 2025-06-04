import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useContext, useEffect, useState } from "react";

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
  const [favourites, setFavourites] = useState([]);

  const addToFavorites = (id) => {
    if (favourites.includes(id)) {
      const updatedFavourites = favourites.filter((itemId) => itemId !== id);
      localStorage.setItem("favouriteGIFs", JSON.stringify(updatedFavourites));
      setFavourites(updatedFavourites);
    }
    else {
      const updatedFavourites = [...favourites, id];
      localStorage.setItem("favouriteGIFs", JSON.stringify(updatedFavourites));
      setFavourites(updatedFavourites);
    }
  }

  useEffect(() => {
    const favouritesGifs = JSON.parse(localStorage.getItem("favouriteGIFs")) || [];
    setFavourites(favouritesGifs);
  }, []);

  return (
    <GifContext.Provider value={{ giphy, gifs, setGifs, filter, setFilter, favourites, addToFavorites }}>
      {children}
    </GifContext.Provider>
  )
}

export default GifProvider;