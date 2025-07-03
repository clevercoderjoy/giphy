import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const GifContext = createContext();

const CACHE_TTL = {
  TRENDING: 15 * 60 * 1000,
  GIF: 30 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  RELATED: 5 * 60 * 1000,
  SEARCH: 5 * 60 * 1000,
  FAVOURITES: 120 * 60 * 1000
}

// Utility to load cache from localStorage
function loadCacheFromStorage() {
  const cache = localStorage.getItem("apiCache");
  if (cache) {
    try {
      return JSON.parse(cache);
    } catch {
      // If corrupted, clear it
      localStorage.removeItem("apiCache");
    }
  }
  return {
    trending: {},
    gifs: {},
    categories: {},
    related: {},
    search: {},
    favourites: {}
  };
}

// Utility to save cache to localStorage
function saveCacheToStorage(cache) {
  localStorage.setItem("apiCache", JSON.stringify(cache));
}

// Initialize apiCache from localStorage
const apiCache = loadCacheFromStorage();

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

  // cache validation

  const isDataCached = useCallback((cacheSection, key, ttl) => {
    if (!key || !cacheSection) {
      return false;
    }

    if (!cacheSection[key]) {
      return false;
    }

    return (
      cacheSection[key].timestamp &&
      typeof cacheSection[key].timestamp === 'number' &&
      Date.now() - cacheSection[key].timestamp < ttl
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
      saveCacheToStorage(apiCache);
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
      saveCacheToStorage(apiCache);
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
      saveCacheToStorage(apiCache);
      setRelatedGifs(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch related Gifs.", error);
      toast.error(`Failed to fetch related Gifs. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const searchGifs = useCallback(async (query, queryParams = { limit: 20, type: "gifs" }) => {
    const cacheKey = `${query}_${queryParams.type}_${queryParams.limit}`;
    if (isDataCached(apiCache.search, cacheKey, CACHE_TTL.SEARCH)) {
      setSearchResults(apiCache.search[cacheKey].data);
      return apiCache.search[cacheKey].data;
    }

    try {
      const { data } = await giphy.search(query, queryParams);
      apiCache.search[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      saveCacheToStorage(apiCache);
      setSearchResults(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch search results.", error.message);
      toast.error(`Failed to fetch search results. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const fetchCategories = useCallback(async (categoryName) => {
    const cacheKey = categoryName || "all";

    if (isDataCached(apiCache.categories, cacheKey, CACHE_TTL.CATEGORIES)) {
      setCategories(apiCache.categories[cacheKey].data);
      return apiCache.categories[cacheKey].data;
    }

    try {
      const { data } = await giphy.categories();
      apiCache.categories[cacheKey] = {
        data,
        timestamp: Date.now(),
      }
      saveCacheToStorage(apiCache);
      setCategories(data);
      return data;
    } catch (error) {
      console.log("Failed to fetch categories.", error);
      toast.error(`Failed to fetch categories. Error: ${error.message}`)
    }
  }, [giphy, isDataCached])

  const fetchFavourites = useCallback(async () => {
    try {
      const storedFavorites = localStorage.getItem("favouriteGifs");
      const favouriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (!favouriteIds.length) {
        setFavourites([]);
        apiCache.favourites = {};
        saveCacheToStorage(apiCache);
        return [];
      }

      const cacheKey = favouriteIds.sort().join(',');
      if (isDataCached(apiCache.favourites, cacheKey, CACHE_TTL.FAVOURITES)) {
        const cachedData = apiCache.favourites[cacheKey].data;
        setFavourites(Array.isArray(cachedData) ? cachedData : []);
        return cachedData;
      }

      try {
        const { data } = await giphy.gifs(favouriteIds);

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data returned from API");
        }

        const validData = data.filter(item => item);

        apiCache.favourites[cacheKey] = {
          data: validData,
          timestamp: Date.now()
        };
        saveCacheToStorage(apiCache);
        setFavourites(validData);
        return validData;
      } catch (error) {
        console.log("Failed to fetch your favourite gifs.", error);
        toast.error(`Failed to fetch your favourite gifs. Error: ${error.message}`);
        setFavourites(favouriteIds);
        apiCache.favourites = {};
        saveCacheToStorage(apiCache);
        return favouriteIds;
      }
    } catch (error) {
      console.error("Unexpected error in fetchFavourites:", error);
      setFavourites([]);
      apiCache.favourites = {};
      saveCacheToStorage(apiCache);
      return [];
    }
  }, [giphy, isDataCached])

  const addToFavorites = useCallback(async (id) => {
    if (!id) return;

    const storedFavorites = localStorage.getItem("favouriteGifs");
    const favouriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

    let updatedFavouriteIds;
    if (favouriteIds.includes(id)) {
      updatedFavouriteIds = favouriteIds.filter(itemId => itemId !== id);
    } else {
      updatedFavouriteIds = [...new Set([...favouriteIds, id])];
    }

    localStorage.setItem("favouriteGifs", JSON.stringify(updatedFavouriteIds));

    // removing stale data from the cache
    Object.keys(apiCache.favourites).forEach(key => {
      if (key.includes(id)) {
        delete apiCache.favourites[key];
      }
    });

    if (updatedFavouriteIds.length === 0) {
      apiCache.favourites = {};
    }
    saveCacheToStorage(apiCache);

    const updatedFavourites = await fetchFavourites();
    setFavourites(updatedFavourites);
  }, [fetchFavourites]);

  const shareGif = useCallback((gif) => {
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

  const embedGif = useCallback((gif) => {
    if (!gif) {
      return;
    }
    try {
      const embadeUrl = `<iframe src=${gif.embed_url} width="480" height="360" style="" frameBorder="0" class="giphy-embed" allowFullScreen></iframe><p><a href=${gif.url}>via GIPHY</a></p>`
      navigator.clipboard.writeText(embadeUrl);
      toast.success("The iFrame to embed has been copied to your clipboard.")
    } catch (error) {
      toast.error(`The iFrame to embed could not be copied to your clipboard. Error: ${error.message}`)
    }
  }, [])

  useEffect(() => {
    const initFavorites = async () => {
      try {
        const storedFavorites = localStorage.getItem("favouriteGifs");

        let localFavorites = [];
        if (storedFavorites) {
          localFavorites = JSON.parse(storedFavorites);
        }
        if (localFavorites.length > 0) {
          await fetchFavourites();
        } else {
          setFavourites([]);
          apiCache.favourites = {};
        }
      } catch (error) {
        console.error("Error initializing favorites:", error);
        setFavourites([]);
      }
    };

    initFavorites();
  }, [fetchFavourites]);

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