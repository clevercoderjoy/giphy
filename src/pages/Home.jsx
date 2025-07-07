import React, { useCallback } from 'react';
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import Filters from '../components/Filters';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import NotFound from './NotFound';

const LIMIT = 20;

const Home = () => {
  const { fetchTrending, filter } = useGif();

  // Function to fetch a page of trending GIFs
  const fetchTrendingPage = useCallback(async ({ page }) => {
    const data = await fetchTrending({
      limit: LIMIT,
      offset: page * LIMIT,
      type: filter
    });
    return data;
  }, [fetchTrending, filter]);

  // Use the infinite scroll hook
  const { items: trendingGifs, hasMore, observerRef, error } = useInfiniteScroll(
    fetchTrendingPage,
    [filter]
  );

  if (error) {
    return <NotFound errorMessage={error} />;
  }

  return (
    <div>
      <img className='mt-2 rounded w-full' src="/banner.gif" alt="earth-banner" />

      <Filters alignLeft showTrending />

      <div className='columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2'>
        {(trendingGifs || []).map((gif, index) => (
          <Gif key={`${gif?.id}-${index}`} gif={gif} />
        ))}
      </div>

      {/* Sentinel div for Intersection Observer */}
      <div ref={observerRef} style={{ height: 1 }} />

      {/* No more GIFs message */}
      {!hasMore && (
        <div className="text-center my-4 text-gray-500">No more GIFs to load.</div>
      )}
    </div>
  );
};

export default Home;