import React, { useEffect } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';

const Favourite = () => {
  const { favourites, fetchFavourites } = useGif();

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites]);

  return (
    <>
      <div className='mt-2'>
        <span className="faded-text">My Favourites</span>

        {favourites.length === 0 ? (
          <div className="text-center mt-8 text-gray-400">
            <p>No favorites found. Add some gifs to your favorites!</p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 mt-2">
            {favourites.map((gif) => {
              if (!gif || !gif.id) return null;
              return (
                <Gif gif={gif} key={gif.id} />
              );
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Favourite