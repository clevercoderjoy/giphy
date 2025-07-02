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
    try {
      const storedFavorites = localStorage.getItem("favouriteGifs");

      let favouriteIds = [];
      if (storedFavorites) {
        try {
          favouriteIds = JSON.parse(storedFavorites);
          if (!Array.isArray(favouriteIds)) {
            favouriteIds = [];
            localStorage.setItem("favouriteGifs", JSON.stringify([]));
          }
        } catch (e) {
          console.error("Error parsing favorites from localStorage", e);
          favouriteIds = [];
          localStorage.setItem("favouriteGifs", JSON.stringify([]));
        }
      }

      if (!favouriteIds.length) {
        setFavourites([]);
        apiCache.favourites = {};
        return [];
      }

      const validIds = favouriteIds.filter(id => id && typeof id === 'string' && id.trim() !== '');

      if (validIds.length !== favouriteIds.length) {
        localStorage.setItem("favouriteGifs", JSON.stringify(validIds));
      }

      if (!validIds.length) {
        setFavourites([]);
        apiCache.favourites = {};
        return [];
      }

      const cacheKey = validIds.sort().join(',');
      if (isDataCached(apiCache.favourites, cacheKey, CACHE_TTL.FAVOURITES)) {
        const cachedData = apiCache.favourites[cacheKey].data;
        setFavourites(Array.isArray(cachedData) ? cachedData : []);
        return cachedData;
      }

      try {
        const { data } = await giphy.gifs(validIds);

        if (!data || !Array.isArray(data)) {
          throw new Error("Invalid data returned from API");
        }

        const validData = data.filter(item => item);

        apiCache.favourites[cacheKey] = {
          data: validData,
          timestamp: Date.now()
        };

        setFavourites(validData);
        return validData;
      } catch (error) {
        console.log("Failed to fetch your favourite gifs.", error);
        toast.error(`Failed to fetch your favourite gifs. Error: ${error.message}`);
        setFavourites(validIds);
        return validIds;
      }
    } catch (error) {
      console.error("Unexpected error in fetchFavourites:", error);
      setFavourites([]);
      return [];
    }
  }, [giphy, isDataCached])

  const addToFavorites = useCallback((id) => {
    if (!id) return;

    const storedFavorites = localStorage.getItem("favouriteGifs");
    const favouriteIds = storedFavorites ? JSON.parse(storedFavorites) : [];

    const safeIds = Array.isArray(favouriteIds) ? favouriteIds : [];

    if (safeIds.includes(id)) {
      const updatedFavouriteIds = safeIds.filter(itemId => itemId !== id);

      localStorage.setItem("favouriteGifs", JSON.stringify(updatedFavouriteIds));

      setFavourites(prevFavs => {
        if (!Array.isArray(prevFavs)) return [];

        if (prevFavs.length > 0 && typeof prevFavs[0] === 'object') {
          return prevFavs.filter(gif => gif && gif.id !== id);
        } else {
          return prevFavs.filter(itemId => itemId !== id);
        }
      });

      Object.keys(apiCache.favourites).forEach(key => {
        if (key.includes(id)) {
          delete apiCache.favourites[key];
        }
      });

      if (updatedFavouriteIds.length === 0) {
        apiCache.favourites = {};
      }
    } else {
      const updatedFavouriteIds = [...new Set([...safeIds, id])];

      localStorage.setItem("favouriteGifs", JSON.stringify(updatedFavouriteIds));

      const gifInTrending = Array.isArray(trendingGifs) && trendingGifs.find(gif => gif && gif.id === id);
      const gifInSearch = Array.isArray(searchResults) && searchResults.find(gif => gif && gif.id === id);
      const gifInCurrent = currentGif && currentGif.id === id ? currentGif : null;
      const gifToAdd = gifInTrending || gifInSearch || gifInCurrent || { id };

      setFavourites(prevFavs => {
        if (!Array.isArray(prevFavs)) return [gifToAdd];

        if (prevFavs.length > 0 && typeof prevFavs[0] === 'object') {
          if (prevFavs.some(gif => gif && gif.id === id)) {
            return prevFavs; // Already exists, no change
          }
          return [...prevFavs, gifToAdd];
        } else {
          return updatedFavouriteIds;
        }
      });
    }

    apiCache.favourites = {};
  }, [trendingGifs, searchResults, currentGif])

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
          try {
            localFavorites = JSON.parse(storedFavorites);

            if (!Array.isArray(localFavorites)) {
              localFavorites = [];
              localStorage.setItem("favouriteGifs", JSON.stringify([]));
            } else if (localFavorites.some(id => !id || typeof id !== 'string')) {
              localFavorites = localFavorites.filter(id => id && typeof id === 'string');
              localStorage.setItem("favouriteGifs", JSON.stringify(localFavorites));
            }
          } catch (e) {
            console.error("Error parsing favorites from localStorage", e);
            localFavorites = [];
            localStorage.setItem("favouriteGifs", JSON.stringify([]));
          }
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