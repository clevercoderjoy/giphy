import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useGif } from '../context/GifContext';
import { HiMiniHeart } from 'react-icons/hi2';
import { IoCodeSharp } from 'react-icons/io5';
import { FaPaperPlane } from 'react-icons/fa6';

const Gif = ({ gif, hover = true }) => {
  if (!gif) {
    return null;
  }

  return <GifContent gif={gif} hover={hover} />;
};

const GifContent = ({ gif, hover }) => {
  const { addToFavorites, favourites, shareGif, embedGif } = useGif();
  const gifType = gif.type || "gif";

  const isFavorite = useMemo(() => {
    if (!favourites.length) return false;

    return favourites.some(favGif => favGif && favGif.id === gif.id);
  }, [favourites, gif.id]);

  return (
    <Link to={`/${gifType}s/${gif?.slug || gif?.id}`}>
      <div className="w-full mb-2 relative cursor-pointer group aspect-video">
        <img
          className="w-full h-full object-cover rounded transition-all duration-300"
          src={gif?.images?.fixed_width?.webp}
          alt={gif?.title}
        />

        {hover && (
          <>
            <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-gradient-to-b from-transparent via-transparent to-black font-bold flex items-end gap-2 p-2 transition-opacity duration-300">
              <img className="h-8 rounded-full" src={gif?.user?.avatar_url} alt={gif?.user?.display_name} />
              <span className="text-white">{gif?.user?.display_name}</span>
            </div>

            <div className="absolute top-0 right-0 h-full opacity-0 group-hover:opacity-50 bg-gradient-to-r from-transparent via-black to-black flex flex-col justify-center items-center gap-4 transition-opacity duration-300">
              <div className="text-white shadow-lg rounded-lg p-3 flex flex-col gap-4">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToFavorites(gif.id);
                  }}
                  className="flex items-center gap-3"
                >
                  <HiMiniHeart
                    size={24}
                    className={`${isFavorite ? 'text-red-500 fill-red-500' : 'text-white'}`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    shareGif(gif);
                  }}
                  className="flex items-center gap-3"
                >
                  <FaPaperPlane size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    embedGif(gif);
                  }}
                  className="flex items-center gap-3"
                >
                  <IoCodeSharp size={24} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

export default Gif;
