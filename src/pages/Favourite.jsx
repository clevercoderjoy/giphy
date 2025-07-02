import React, { useEffect, useState } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';

const Favourite = () => {
  const { favourites, fetchFavourites } = useGif();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      await fetchFavourites();
      setIsLoading(false);
    };

    loadFavorites();
  }, [fetchFavourites]);

  return (
    <>
      <div className='mt-2'>
        <span className="faded-text">My Favourites</span>

        {isLoading ? (
          <div className="flex justify-center items-center mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !Array.isArray(favourites) || favourites.length === 0 ? (
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