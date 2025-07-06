import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_LIMIT = 20;

function useInfiniteScroll(fetchFn, deps = [], limit = DEFAULT_LIMIT) {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const observerRef = useRef();

  const loadMore = useCallback(async () => {
    if (!hasMore) {
      return;
    }
    const newItems = await fetchFn({ page });
    // Defensive programming
    setItems(prev => {
      const ids = new Set(prev.map(item => item.id));
      const filtered = newItems.filter(item => !ids.has(item.id));
      return [...prev, ...filtered];
    });

    // if we got a full page, there might be more
    // If we got fewer than the limit, we've reached the end
    const newHasMore = newItems.length >= limit;
    setHasMore(newHasMore);
    setPage(prev => prev + 1);
  }, [fetchFn, hasMore, page, limit])

  // Reset mechanism for infinite scroll when dependencies change
  useEffect(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    // Load the first page immediately
    const loadFirstPage = async () => {
      const newItems = await fetchFn({ page: 0 });
      setItems(newItems);

      // Simple logic: if we got a full page, there might be more
      const newHasMore = (newItems).length >= limit;
      setHasMore(newHasMore);
      setPage(1);
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

  return { items, hasMore, observerRef };
}

export default useInfiniteScroll;