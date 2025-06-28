import React, { useEffect } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';

const Favourite = () => {
  const { favourites, fetchFavourites } = useGif();

  useEffect(() => {
    fetchFavourites()
  }, [fetchFavourites]);

  return (
    <>
      <div className='mt-2'>
        <span className="faded-text">My Favourites</span>
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 mt-2">
          {
            favourites.map((gif) => {
              return (
                <Gif gif={gif} key={gif?.id} />
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default Favourite