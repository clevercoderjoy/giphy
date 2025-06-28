import React from 'react';
import { Link } from 'react-router-dom';
import { useGif } from '../context/GifContext';
import { HiMiniHeart } from 'react-icons/hi2';
import { IoCodeSharp } from 'react-icons/io5';
import { FaPaperPlane } from 'react-icons/fa6';

const Gif = ({ gif, hover = true }) => {
  const { addToFavorites, favourites, shareGif, EmbedGif } = useGif();
  console.log(gif)
  if (!gif) {
    return null;
  }

  const gifType = gif.type || "gif";

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
            {/* Bottom Overlay: Username */}
            <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-gradient-to-b from-transparent via-transparent to-black font-bold flex items-end gap-2 p-2 transition-opacity duration-300">
              <img className="h-8 rounded-full" src={gif?.user?.avatar_url} alt={gif?.user?.display_name} />
              <span className="text-white">{gif?.user?.display_name}</span>
            </div>

            {/* Right Side Overlay: Buttons */}
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
                    className={`${favourites?.includes(gif.id) ? 'text-red-500' : ''}`}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    shareGif();
                  }}
                  className="flex items-center gap-3"
                >
                  <FaPaperPlane size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    EmbedGif();
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
