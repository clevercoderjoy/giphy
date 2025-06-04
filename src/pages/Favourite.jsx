import React, { useEffect, useState } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';

const Favourite = () => {
  const { giphy, favourites } = useGif();
  const [favouriteGIFs, setFavouriteGIFs] = useState([]);

  useEffect(() => {
    const fetchFavouriteGIFs = async () => {
      if (!favourites.length) {
        return;
      }

      try {
        const { data } = await giphy.gifs(favourites);
        setFavouriteGIFs(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchFavouriteGIFs();
  }, [favourites, giphy]);

  return (
    <>
      <div className='mt-2'>
        <span className="faded-text">My Favourites</span>
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 mt-2">
          {
            favouriteGIFs.map((gif) => {
              return (
                <Gif gif={gif} key={gif.id} />
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default Favourite