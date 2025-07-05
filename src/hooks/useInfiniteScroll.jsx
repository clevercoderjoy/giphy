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
    setItems(prev => {
      const ids = new Set(prev.map(item => item.id));
      const filtered = newItems.filter(item => !ids.has(item.id));
      return [...prev, ...filtered];
    });
    
    // Simple logic: if we got a full page, there might be more
    // If we got fewer than the limit, we've reached the end
    const newHasMore = newItems.length >= limit;
    console.log('loadMore - setting hasMore to:', newHasMore, '(got', newItems.length, 'items, limit is', limit, ')');
    setHasMore(newHasMore);
    setPage(prev => prev + 1);
  }, [fetchFn, hasMore, page, limit])

  // Reset and load first page when dependencies change
  useEffect(() => {
    console.log('useInfiniteScroll - dependencies changed, resetting');
    setItems([]);
    setPage(0);
    setHasMore(true);
    // Load the first page immediately
    const loadFirstPage = async () => {
      const newItems = await fetchFn({ page: 0 });
      console.log('useInfiniteScroll - first page loaded:', newItems?.length || 0, 'items');
      setItems(newItems || []);
      
      // Simple logic: if we got a full page, there might be more
      const newHasMore = (newItems || []).length >= limit;
      console.log('useInfiniteScroll - setting hasMore to:', newHasMore, '(got', newItems?.length || 0, 'items, limit is', limit, ')');
      setHasMore(newHasMore);
      setPage(1);
    };
    loadFirstPage();
  }, deps)

  useEffect(() => {
    console.log('useInfiniteScroll - setting up intersection observer');
    const observer = new window.IntersectionObserver(entries => {
      console.log('Intersection observer triggered:', entries[0].isIntersecting, 'hasMore:', hasMore);
      if (entries[0].isIntersecting && hasMore) {
        console.log('Loading more items...');
        loadMore();
      }
    });
    if (observerRef.current) {
      observer.observe(observerRef.current);
      console.log('Observer attached to element');
    }
    return () => observer.disconnect();
  }, [hasMore, loadMore])

  return { items, hasMore, observerRef };
}

export default useInfiniteScroll;