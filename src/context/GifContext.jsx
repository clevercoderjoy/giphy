import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const GifContext = createContext();

const apiCache = {
  trending: {},
  gifs: {},
  categoris: {},
  related: {},
  search: {},
  favourites: {}
}

const CACHE_TTL = {
  TRENDING: 15 * 60 * 1000,
  GIF: 30 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  RELATED: 5 * 60 * 1000,
  SEARCH: 5 * 60 * 1000,
  FAVOURITES: 120 * 60 * 1000
}

export const useGif = () => {
  const context = useContext(GifContext);
  if (!context) {
    throw new Error("useGif must be used within a gifProvider");
  }
  return context;
}

const GifProvider = ({ children }) => {

  const giphy = useMemo(() => new GiphyFetch(import.meta.env.VITE_GIPHY_KEY), []);

  const [trendingGifs, setTrendingGifs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentGif, setCurrentGif] = useState(null);
  const [relatedGifs, setRelatedGifs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState("gifs");
  const [favourites, setFavourites] = useState([]);

  useEffect(() => {
    const favouriteGifs = JSON.parse(localStorage.getItem("favouriteGifs")) || [];
    setFavourites(favouriteGifs);
  }, [])

  const isDataCached = useCallback((cacheSection, key, ttl) => {
    return (
      cacheSection[key] && cacheSection[key].timestamp && Date.now() - cacheSection[key].timestamp < ttl
    );
  }, [])

  const fetchTrending = useCallback(async (queryParams = { limit: 20, type: "gifs" }) => {
    const cacheKey = `${queryParams.type}_${queryParams.limit}`;
    if (isDataCached(apiCache.trending, cacheKey, CACHE_TTL.TRENDING)) {
      setTrendingGifs(apiCache.trending[cacheKey].data);
      return apiCache.trending[cacheKey].data;
    }
    try {
      const { data } = await giphy.trending(queryParams);
      apiCache.trending[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      setTrendingGifs(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch trending Gifs.", error);
      toast.error(`Failed to fetch trending Gifs. Error: ${error.message}`)
    }
  }, [giphy, isDataCached]);

  const fetchGif = useCallback(async (id) => {
    if (isDataCached(apiCache.gifs, id, CACHE_TTL.GIF)) {
      setCurrentGif(apiCache.gifs[id].data);
      return apiCache.gifs[id].data;
    }

    try {
      const { data } = await giphy.gif(id);
      apiCache.gifs[id] = {
        data,
        timestamp: Date.now()
      }
      setCurrentGif(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch gif.", error);
      toast.success(`Failed to fetch gif. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const fetchRelatedGifs = useCallback(async (id, queryParams = { limit: 10 }) => {
    const cacheKey = `${id}_${queryParams.limit}`;

    if (isDataCached(apiCache.related, cacheKey, CACHE_TTL.RELATED)) {
      setRelatedGifs(apiCache.related[cacheKey].data);
      return apiCache.related[cacheKey].data;
    }

    try {
      const { data } = await giphy.related(id, queryParams);
      apiCache.related[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      setRelatedGifs(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch related Gifs.", error);
      toast.error(`Failed to fetch related Gifs. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const searchGifs = useCallback(async (query, queryParams = { limit: 20, type: "gifs" }) => {
    const cacheKey = `${query}_${queryParams.type}_${queryParams.limit}`;
    if (isDataCached(apiCache.search[cacheKey].data, cacheKey, CACHE_TTL.SEARCH)) {
      setSearchResults(apiCache.search[cacheKey].data);
      return apiCache.search[cacheKey].data;
    }

    try {
      const { data } = await giphy.search(query, queryParams);
      apiCache.search[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      setSearchResults(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch search results.", error.message);
      toast.error(`Failed to fetch search results. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const fetchCategories = useCallback(async (categoryName) => {
    const cacheKey = categoryName || "all";

    if (isDataCached(apiCache.categoris, cacheKey, CACHE_TTL.CATEGORIES)) {
      setCategories(apiCache.categoris[cacheKey].data);
      return apiCache.categoris[cacheKey].data;
    }

    try {
      const { data } = await giphy.categories();
      apiCache.categoris[cacheKey] = {
        data,
        timestamp: Date.now(),
      }
      setCategories(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch categories.", error);
      toast.error(`Failed to fetch categories. Error: ${error.message}`)
    }
  }, [giphy, isDataCached])

  const fetchFavourites = useCallback(async () => {
    const favouriteIds = JSON.parse(localStorage.getItem("favouriteGifs")) || [];

    if (!favouriteIds.length) {
      setFavourites([]);
      return [];
    }

    const cacheKey = favouriteIds.sort().join(',');
    if (isDataCached(apiCache.favourites, cacheKey, CACHE_TTL.FAVOURITES)) {
      setFavourites(apiCache.favourites[cacheKey].data);
      return apiCache.favourites[cacheKey].data;
    }

    try {
      const { data } = await giphy.gifs(favouriteIds);
      apiCache.favourites[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      setFavourites(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch your favourite gifs.", error);
      toast.error(`Failed to fetch your favourite gifs. Error: ${error.message}`)
    }
  }, [giphy, isDataCached])

  const addToFavorites = useCallback((id) => {
    setFavourites(currFavs => {
      const favouriteIds = JSON.parse(localStorage.getItem("favouriteGifs")) || [];

      if (favouriteIds.includes(id)) {
        const updatedFavourites = currFavs.filter(itemId => itemId !== id);
        localStorage.setItem("favouriteGifs", JSON.stringify(updatedFavourites));
        if (currFavs.length && typeof currFavs[0] === 'object') {
          return currFavs.filter(gif => gif.id !== id);
        }
        return updatedFavourites;
      }
      else {
        const updatedFavourites = [...favouriteIds, id];
        localStorage.setItem("favouriteGifs", JSON.stringify(updatedFavourites));
        return updatedFavourites;
      }
    })
  }, [])

  const shareGif = useCallback((gif) => {
    console.log("gifgif", gif)
    if (!gif) {
      return;
    }
    try {
      navigator.clipboard.writeText(gif.url)
      toast.success("URL to share the gif has been copied to your clipboard.");
    } catch (error) {
      console.log("URL to share the gif could not be copied to your clipboard.", error.message)
      toast.error(`URL to share the gif could not be copied to your clipboard. Error: ${error.message}`);
    }
  }, [])

  const embedGif = () => { }

  useEffect(() => {
    const favouritesGifs = JSON.parse(localStorage.getItem("favouriteGifs")) || [];
    setFavourites(favouritesGifs);
  }, []);

  return (
    <GifContext.Provider
      value={{
        trendingGifs,
        searchResults,
        currentGif,
        relatedGifs,
        categories,
        filter,
        favourites,
        setFilter,
        fetchTrending,
        fetchGif,
        fetchRelatedGifs,
        fetchFavourites,
        searchGifs,
        fetchCategories,
        addToFavorites,
        shareGif,
        embedGif,
      }}>
      {children}
    </GifContext.Provider>
  )
}

export default GifProvider;