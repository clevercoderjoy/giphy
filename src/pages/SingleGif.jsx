import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import { HiMiniChevronDoubleDown, HiMiniChevronDoubleUp, HiMiniHeart } from 'react-icons/hi2';
import FollowOn from './../components/FollowOn';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FaPaperPlane } from 'react-icons/fa6';
import { IoCodeSharp } from 'react-icons/io5';
import useInfiniteScroll from '../hooks/useInfiniteScroll';

const LIMIT = 10;

const SingleGif = () => {

  const { type, slug } = useParams();
  const { fetchRelatedGifsPage, fetchSingleGif, currentGif, addToFavorites, favourites, shareGif, embedGif } = useGif();
  const [readMore, setReadMore] = useState(false);
  const [gifId, setGifId] = useState(null);

  // Function to fetch related GIFs page
  const fetchRelatedPage = useCallback(async ({ page }) => {
    const data = await fetchRelatedGifsPage({
      gifId,
      page,
      limit: LIMIT
    });
    return data;
  }, [gifId, fetchRelatedGifsPage]);

  const { items: relatedInfinite, hasMore: hasMoreRelated, observerRef: relatedObserverRef } =
    useInfiniteScroll(fetchRelatedPage, [gifId], LIMIT);

  const isFavorite = useMemo(() => {
    if (!currentGif || !favourites.length) return false;

    return favourites.some(favGif => favGif && favGif.id === currentGif.id);
  }, [favourites, currentGif]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await fetchSingleGif(slug, type);
        setGifId(id);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fetchSingleGif, slug, type]);

  return (
    <>
      <div className="grid grid-cols-4 gap-4 my-10">
        <div className="hidden sm:block">
          {
            currentGif?.user && (
              <>
                <div className='flex gap-1'>
                  <img className='h-14' src={currentGif?.user?.avatar_url} alt={currentGif?.user?.display_name} />
                  <div className="px-2">
                    <div className="font-bold">
                      {currentGif?.user?.display_name}
                    </div>
                    <div className="fadded-text">
                      @{currentGif?.user?.username}
                    </div>
                  </div>
                </div>
                {
                  currentGif?.user?.description && (
                    <>
                      {
                        currentGif?.user?.description.length <= 100 ? (
                          <div className='py-4 whitespace-pre-line text-sm text-gray-400'>
                            {currentGif?.user?.description}
                          </div>
                        ) :
                          (
                            <div className='py-4 whitespace-pre-line text-sm text-gray-400'>
                              {
                                readMore ? currentGif?.user?.description : currentGif?.user?.description.slice(0, 100) + "..."
                              }
                              <div className='flex items-center faded-text cursor-pointer' onClick={() => setReadMore(!readMore)}>
                                {
                                  readMore ? (
                                    <>
                                      Read Less
                                      <HiMiniChevronDoubleUp size={20} />
                                    </>
                                  ) : (
                                    <>
                                      Read More
                                      <HiMiniChevronDoubleDown size={20} />
                                    </>
                                  )
                                }
                              </div>
                            </div>
                          )
                      }
                    </>
                  )
                }
              </>
            )
          }
          <FollowOn />
          <div className="divider" />

          {
            currentGif?.source && (
              <div>
                <span className="fadded-text">
                  Source
                </span>
                <div className="flex items-center text-sm font-bold gap-1">
                  <HiOutlineExternalLink size={25} />
                  <a className='truncate' href={currentGif?.source} target="_blank" rel="noopener noreferrer">{currentGif?.source}</a>
                </div>
              </div>
            )
          }
        </div>

        <div className="col-span-4 sm:col-span-3">
          <div className='flex gap-6'>
            <div className='w-full sm:w-3/4'>
              <div className="title faded-text truncate mb-2">{currentGif?.title}</div>
              <Gif gif={currentGif} hover={false} />

              {/* mobile ui */}
              <div className="flex sm:hidden gap-1">
                <img className='h-14' src={currentGif?.user?.avatar_url} alt={currentGif?.user?.display_name} />
                <div className="px-2">
                  <div className="font-bold">
                    {currentGif?.user?.display_name}
                  </div>
                  <div className="fadded-text">
                    @{currentGif?.user?.username}
                  </div>
                </div>
                <button className="ml-auto" onClick={shareGif}>
                  <FaPaperPlane size={25} />
                </button>
              </div>
            </div>

            {/* share */}
            <div className="hidden sm:flex flex-col gap-5 mt-6">
              <button
                onClick={() => addToFavorites(currentGif?.id)}
                className="flex gap-5 items-center font-bold text-lg"
              >
                <HiMiniHeart
                  size={30}
                  className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
                />
                Favourite
              </button>
              <button
                onClick={() => shareGif(currentGif)}
                className="flex gap-6 items-center font-bold text-lg"
              >
                <FaPaperPlane size={25} />
                Share
              </button>
              {/* Embade Gif */}
              <button
                onClick={() => embedGif(currentGif)}
                className="flex gap-5 items-center font-bold text-lg"
              >
                <IoCodeSharp size={30} />
                Embed
              </button>
            </div>
          </div>
          <div>
            <div className='font-extrabold my-4'>Related GIFs ({relatedInfinite.length})</div>
            {relatedInfinite.length > 0 ? (
              <>
                <div className="columns-2 md:columns-3 gap-2">
                  {relatedInfinite.map((gif) => (
                    <Gif gif={gif} key={gif.id} />
                  ))}
                </div>

                {/* Sentinel div for Intersection Observer - moved outside columns */}
                <div ref={relatedObserverRef} style={{ height: 20, marginTop: 20 }} />

                {/* Loading indicator */}
                {hasMoreRelated && (
                  <div className="text-center my-4 text-gray-500">Loading more related GIFs...</div>
                )}

                {/* No more results message */}
                {!hasMoreRelated && (
                  <div className="text-center my-4 text-gray-500">No more related GIFs to load.</div>
                )}
              </>
            ) : (
              <div className="text-center my-4 text-gray-500">
                {gifId ? "Loading related GIFs..." : "Loading..."}
              </div>
            )}
          </div>
        </div>
      </div >
    </>
  )
}

export default SingleGif