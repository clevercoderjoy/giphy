import React, { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom';
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import FollowOn from '../components/FollowOn';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const LIMIT = 20;

const Category = () => {

  const { category } = useParams();
  const { fetchCategories, fetchCategoryGifs, filter } = useGif();

  // Function to fetch Gifs of that category
  const fetchCategoryPage = useCallback(async ({ page }) => {
    const data = await fetchCategoryGifs({
      category,
      sort: "relevant",
      lang: "en",
      type: filter,
      limit: LIMIT,
      offset: page * LIMIT,
    });
    return data;
  }, [category, fetchCategoryGifs, filter]);

  // Use the infinite scroll hook
  const { items: categoryGifs, hasMore, observerRef } = useInfiniteScroll(
    fetchCategoryPage,
    [filter, category]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <>
      <h2 className='text-5xl font-extrabold p-3'>{category} GIFs</h2>
      <div className='flex flex-col sm:flex-row gap-5 my-4'>
        <div className='w-full sm:w-72'>
          {
            categoryGifs && categoryGifs?.length > 0 && (
              <Gif gif={categoryGifs[0]} hover={false} />
            )
          }
          <span className="text-gray-400 text-sm pt-2">
            Don&apos;t tell it to me, Just GIF it to me!
          </span>
          <FollowOn />
          <div className="divider" />
        </div>
        <div>
          {
            categoryGifs && categoryGifs.length > 0 ? (
              <>
                <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
                  {
                    categoryGifs?.slice(1)?.map((gif) => {
                      return (
                        <Gif gif={gif} key={gif?.id} />
                      )
                    })
                  }
                </div>

                {/* Sentinel div for Intersection Observer */}
                <div ref={observerRef} style={{ height: 1 }} />

                {/* Loading indicator */}
                {hasMore && (
                  <div className="text-center my-4 text-gray-500">Loading more {category} GIFs...</div>
                )}

                {/* No more results message */}
                {!hasMore && (
                  <div className="text-center my-4 text-gray-500">No more {category} GIFs to load.</div>
                )}
              </>
            ) : (
              <div className="text-center p-8">
                <p className="text-xl">Loading {category} GIFs...</p>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}

export default Category;