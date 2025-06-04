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
  const { giphy, addToFavorites, favourites } = useGif();
  const [gif, setGif] = useState({});
  const [relatedGifs, setRelatedGifs] = useState([]);
  const [readMore, setReadMore] = useState(false);

  console.log("favorites", favourites)

  const shareGif = () => { }

  const EmbedGif = () => { }

  useEffect(() => {
    if (!contentType.includes(type)) {
      throw new Error("Invalid content type.");
    }
    const fetchGif = async () => {
      const gifId = slug.split("-");
      const { data } = await giphy.gif(gifId[gifId.length - 1]);
      setGif(data);
      const { data: relatedData } = await giphy.related(gifId[gifId.length - 1], { limit: 10 });
      setRelatedGifs(relatedData);
    }

    fetchGif();
  }, [giphy, slug, type])

  return (
    <>
      <div className="grid grid-cols-4 gap-4 my-10">
        <div className="hidden sm:block">
          {
            gif.user && (
              <>
                <div className='flex gap-1'>
                  <img className='h-14' src={gif?.user?.avatar_url} alt={gif?.user?.display_name} />
                  <div className="px-2">
                    <div className="font-bold">
                      {gif?.user?.display_name}
                    </div>
                    <div className="fadded-text">
                      @{gif?.user?.username}
                    </div>
                  </div>
                </div>
                {
                  gif?.user?.description && (
                    <>
                      {
                        gif?.user?.description.length <= 100 ? (
                          <div className='py-4 whitespace-pre-line text-sm text-gray-400'>
                            {gif?.user?.description}
                          </div>
                        ) :
                          (
                            <div div className='py-4 whitespace-pre-line text-sm text-gray-400'>
                              {
                                readMore ? gif?.user?.description : gif?.user?.description.slice(0, 100) + "..."
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
            gif?.source && (
              <div>
                <span className="fadded-text">
                  Source
                </span>
                <div className="flex items-center text-sm font-bold gap-1">
                  <HiOutlineExternalLink size={25} />
                  <a className='truncate' href={gif?.source} target="_blank" rel="noopener noreferrer">{gif?.source}</a>
                </div>
              </div>
            )
          }
        </div>

        <div className="col-span-4 sm:col-span-3">
          <div className='flex gap-6'>
            <div className='w-full sm:w-3/4'>
              <div className="title faded-text truncate mb-2">{gif.title}</div>
              <Gif gif={gif} hover={false} />

              {/* mobile ui */}
              <div className="flex sm:hidden gap-1">
                <img className='h-14' src={gif?.user?.avatar_url} alt={gif?.user?.display_name} />
                <div className="px-2">
                  <div className="font-bold">
                    {gif?.user?.display_name}
                  </div>
                  <div className="fadded-text">
                    @{gif?.user?.username}
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
                onClick={() => addToFavorites(gif.id)}
                className="flex gap-5 items-center font-bold text-lg"
              >
                <HiMiniHeart
                  size={30}
                  className={`${favourites?.includes(gif.id) ? "text-red-500" : ""
                    }`}
                />
                Favourite
              </button>
              <button
                onClick={shareGif}
                className="flex gap-6 items-center font-bold text-lg"
              >
                <FaPaperPlane size={25} />
                Share
              </button>
              <button
                onClick={EmbedGif}
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
                relatedGifs.slice(1).map((gif) => {
                  return (
                    <Gif gif={gif} key={gif.id} />
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