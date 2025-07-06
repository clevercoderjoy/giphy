import React, { useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useGif } from '../context/GifContext';
import Filters from '../components/Filters';
import Gif from '../components/Gif';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const LIMIT = 20;

const Search = () => {

  const { query } = useParams();
  const { searchGifs, filter } = useGif();

  // Function to fetch a page of search results
  const fetchSearchPage = useCallback(async ({ page }) => {
    const data = await searchGifs(query, {
      sort: "relevant",
      lang: "en",
      type: filter,
      limit: LIMIT,
      offset: page * LIMIT,
    });
    return data;
  }, [query, searchGifs, filter]);

  // Use the infinite scroll hook
  const { items: searchResults, hasMore, observerRef } = useInfiniteScroll(
    fetchSearchPage,
    [filter, query]
  );

  return (
    <>
      <div className='my-4'>
        <h2 className='text-5xl font-extrabold p-3'>{query}</h2>
        <Filters alignLeft={true} />
        {
          searchResults.length > 0 ? (
            <>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
                {searchResults.map((gif, index) => (
                  <Gif key={`${gif?.id}-${index}`} gif={gif} />
                ))}
              </div>

              {/* Sentinel div for Intersection Observer */}
              <div ref={observerRef} style={{ height: 1 }} />

              {/* No more results message */}
              {!hasMore && (
                <div className="text-center my-4 text-gray-500">No more search results to load.</div>
              )}
            </>
          ) : (
            <span>No GIFs found for {query}.</span>
          )
        }
      </div>
    </>
  )
}

export default Search