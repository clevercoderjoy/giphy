import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { contentType } from '../data/contentType';

const GifContext = createContext();

const CACHE_TTL = {
  TRENDING: 15 * 60 * 1000,
  GIF: 30 * 60 * 1000,
  CATEGORIES: 60 * 60 * 1000,
  RELATED: 5 * 60 * 1000,
  SEARCH: 2 * 60 * 1000,
  FAVOURITES: 120 * 60 * 1000
}

// load cache from localStorage
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

// save cache to localStorage with size management
function saveCacheToStorage(cache) {
  try {
    // Check cache size before saving
    const cacheString = JSON.stringify(cache);
    const cacheSize = new Blob([cacheString]).size;
    const maxSize = 4.5 * 1024 * 1024;

    if (cacheSize > maxSize) {
      // Clean up old entries from each cache section
      Object.keys(cache).forEach(section => {
        const entries = Object.entries(cache[section]);
        // Sort by timestamp (oldest first) and remove oldest 50%
        const sortedEntries = entries.sort((a, b) =>
          (a[1]?.timestamp) - (b[1]?.timestamp)
        );
        const entriesToRemove = Math.floor(entries.length * 0.5);
        sortedEntries.slice(0, entriesToRemove).forEach(([key]) => {
          delete cache[section][key];
        });
      });
    }

    localStorage.setItem("apiCache", JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save cache to localStorage:', error);
    try {
      localStorage.removeItem("apiCache");
    } catch (clearError) {
      console.error('Failed to clear localStorage:', clearError);
    }
  }
}

// Initialize apiCache from localStorage
const apiCache = loadCacheFromStorage();

export const useGif = () => {
  return useContext(GifContext);
}

const GifProvider = ({ children }) => {

  const giphy = useMemo(() => new GiphyFetch(import.meta.env.VITE_GIPHY_KEY), []);

  const [trendingGifs, setTrendingGifs] = useState([]);
  const [currentGif, setCurrentGif] = useState(null);
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

    return Date.now() - cacheSection[key].timestamp < ttl;
  }, [])

  const fetchTrending = useCallback(async (queryParams = { limit: 20, type: "gifs" }) => {
    const offset = typeof queryParams.offset === 'number' ? queryParams.offset : 0;
    const cacheKey = `${queryParams.type}_${queryParams.limit}_${queryParams.offset}`;
    if (isDataCached(apiCache.trending, cacheKey, CACHE_TTL.TRENDING)) {
      setTrendingGifs(apiCache.trending[cacheKey].data);
      return apiCache.trending[cacheKey].data;
    }
    try {
      const { data } = await giphy.trending({ ...queryParams, offset });
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

  const fetchSingleGif = useCallback(async (slug, type) => {
    if (!contentType.includes(type)) {
      throw new Error("Invalid content type.");
    }

    const gifIdParts = slug.split("-");
    const id = gifIdParts[gifIdParts.length - 1];

    if (!id) {
      throw new Error("Invalid GIF ID.");
    }

    const data = await fetchGif(id);
    return { id, data };
  }, [fetchGif])

  const fetchRelatedGifs = useCallback(async (id, queryParams = { limit: 10 }) => {
    const offset = typeof queryParams.offset === 'number' ? queryParams.offset : 0;
    const cacheKey = `${id}_${queryParams.limit}_${queryParams.offset}`;

    if (isDataCached(apiCache.related, cacheKey, CACHE_TTL.RELATED)) {
      return apiCache.related[cacheKey].data;
    }

    try {
      const { data } = await giphy.related(id, { ...queryParams, offset });
      apiCache.related[cacheKey] = {
        data,
        timestamp: Date.now()
      }
      saveCacheToStorage(apiCache);
      return data;
    } catch (error) {
      console.log("Failed to fetch related Gifs.", error);
      toast.error(`Failed to fetch related Gifs. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const fetchRelatedGifsPage = useCallback(async (queryParams = { limit: 10 }) => {
    const { gifId, page } = queryParams;

    if (!gifId) {
      return [];
    }

    const offset = page * queryParams.limit;
    const data = await fetchRelatedGifs(gifId, {
      limit: queryParams.limit,
      offset
    });
    return data || [];
  }, [fetchRelatedGifs])

  const searchGifs = useCallback(async (query, queryParams = { limit: 20, type: "gifs" }) => {
    const offset = typeof queryParams.offset === 'number' ? queryParams.offset : 0;
    const cacheKey = `${query}_${queryParams.type}_${queryParams.limit}_${offset}`;

    if (isDataCached(apiCache.search, cacheKey, CACHE_TTL.SEARCH)) {
      return apiCache.search[cacheKey].data;
    }

    try {
      const { data } = await giphy.search(query, { ...queryParams, offset });
      apiCache.search[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      saveCacheToStorage(apiCache);
      return data;
    } catch (error) {
      console.log("Failed to fetch search results.", error.message);
      toast.error(`Failed to fetch search results. Error: ${error.message}`);
    }
  }, [giphy, isDataCached])

  const fetchCategoryGifs = useCallback(async (queryParams = { limit: 20, type: "gifs" }) => {
    const offset = typeof queryParams.offset === 'number' ? queryParams.offset : 0;
    const category = queryParams.category;

    if (!category) {
      console.error("Category is required for fetchCategoryGifs");
      return [];
    }

    const cacheKey = `category_${category}_${queryParams.type}_${queryParams.limit}_${offset}`;

    if (isDataCached(apiCache.search, cacheKey, CACHE_TTL.SEARCH)) {
      return apiCache.search[cacheKey].data;
    }

    try {
      const { data } = await giphy.search(category, {
        sort: "relevant",
        lang: "en",
        ...queryParams,
        offset
      });
      apiCache.search[cacheKey] = {
        data,
        timestamp: Date.now()
      };
      saveCacheToStorage(apiCache);
      return data;
    } catch (error) {
      console.log("Failed to fetch category GIFs.", error.message);
      toast.error(`Failed to fetch category GIFs. Error: ${error.message}`);
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

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem("apiCache");
      Object.keys(apiCache).forEach(key => {
        apiCache[key] = {};
      });
      toast.success("Cache cleared successfully");
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error("Failed to clear cache");
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
        currentGif,
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
        clearCache,
        fetchCategoryGifs,
        fetchRelatedGifsPage,
        fetchSingleGif,
      }}>
      {children}
    </GifContext.Provider>
  )
}

export default GifProvider;