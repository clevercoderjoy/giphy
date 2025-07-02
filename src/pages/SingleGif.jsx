import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { contentType } from './../data/contentType';
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import { HiMiniChevronDoubleDown, HiMiniChevronDoubleUp, HiMiniHeart } from 'react-icons/hi2';
import FollowOn from './../components/FollowOn';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FaPaperPlane } from 'react-icons/fa6';
import { IoCodeSharp } from 'react-icons/io5';

const SingleGif = () => {

  const { type, slug } = useParams();
  const { fetchRelatedGifs, fetchGif, currentGif, relatedGifs, addToFavorites, favourites, shareGif, embedGif } = useGif();
  const [readMore, setReadMore] = useState(false);

  const isFavorite = React.useMemo(() => {
    if (!currentGif || !Array.isArray(favourites) || !favourites.length) return false;

    if (typeof favourites[0] === "string") {
      return favourites.includes(currentGif.id);
    }

    return favourites.some(favGif => favGif && favGif.id === currentGif.id);
  }, [favourites, currentGif]);

  useEffect(() => {
    if (!contentType.includes(type)) {
      throw new Error("Invalid content type.");
    }
    const fetchData = async () => {
      try {
        const gifId = slug.split("-");
        const id = gifId[gifId.length - 1];
        console.log(id)
        await fetchGif(id);
        await fetchRelatedGifs(id, { limit: 10 })
      } catch (error) {
        console.log(error)
      }
    }

    fetchData();
  }, [fetchGif, fetchRelatedGifs, slug, type])

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
            <span className='font-extrabold'>Related GIFs</span>
            <div className="columns-2 md:columns-3 gap-2">
              {
                relatedGifs.slice(1).map((currentGif) => {
                  return (
                    <Gif gif={currentGif} key={currentGif.id} />
                  )
                })
              }
            </div>
          </div>
        </div>
      </div >
    </>
  )
}

export default SingleGif