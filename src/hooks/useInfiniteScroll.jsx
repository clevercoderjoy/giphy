import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LIMIT = 20;

function useInfiniteScroll(fetchFn, deps = [], limit = DEFAULT_LIMIT) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState(null);

  const observerRef = useRef();

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      return;
    }
    try {
      const newItems = await fetchFn({ page }) || [];
      setItems(prev => {
        const ids = new Set(prev.map(item => item.id));
        const filtered = newItems.filter(item => item && !ids.has(item.id));
        return [...prev, ...filtered];
      });
      const newHasMore = newItems.length >= limit;
      setHasMore(newHasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError("API se data nahi aa raha hai. Ho sakta hai rate limit exceed ho gayi ho.");
      setHasMore(false);
    }
  }, [fetchFn, hasMore, page, limit])

  // Reset mechanism for infinite scroll when dependencies change
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
    // Load the first page immediately
    const loadFirstPage = async () => {
      try {
        const newItems = await fetchFn({ page: 0 }) || [];
        setItems(newItems);
        const newHasMore = (newItems).length >= limit;
        setHasMore(newHasMore);
        setPage(1);
      } catch (err) {
        setError("API se data nahi aa raha hai. Ho sakta hai rate limit exceed ho gayi ho.");
        setItems([]);
        setHasMore(false);
      }
    };
    loadFirstPage();
  }, deps)

  useEffect(() => {
    const observer = new window.IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => observer.disconnect();
  }, [hasMore, loadMore])

  return { items: items || [], hasMore, observerRef, error };
}

export default useInfiniteScroll;