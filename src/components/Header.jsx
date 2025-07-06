import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { HiEllipsisVertical, HiMiniBars3BottomRight } from "react-icons/hi2";
import { useGif } from './../context/GifContext';
import SearchBar from './SearchBar';

const Header = () => {

  const navigate = useNavigate();
  const { favourites, fetchCategories, categories, fetchFavourites } = useGif();
  const [showCategories, setShowCategories] = useState(false);

  const handleCategoryClick = (category) => {
    setShowCategories(false);
    navigate(`/${category.name}`);
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories])

  useEffect(() => {
    fetchFavourites();
  }, [fetchFavourites])

  return (
    <nav>
      <div className='relative flex gap-2 justify-between items-center mb-2'>

        {/* logo */}
        <Link className='logo flex gap-2' to="/">
          <img className='w-8' src="/logo.svg" alt="giphy-logo" />
          <h1 className='text-5xl font-bold tracking-tight cursor-pointer'>GIPHY</h1>
        </Link>

        {/* categories */}
        {
          categories?.slice(0, 5)?.map((category) => {
            return (
              <Link className='whitespace-nowrap truncate px-4 py-1 transition ease-in-out gradient border-b-4 hidden lg:block' key={category.name} to={`/${category.name}`}>{category.name}</Link>
            )
          })
        }
        <div className='font-bold text-md flex items-center gap-2'>
          <button onClick={() => setShowCategories(!showCategories)}>
            <HiEllipsisVertical className={`py-0.5 transition ease-in-out gradient ${showCategories ? "gradient-menu" : ""
              } border-b-4 cursor-pointer hidden lg:block`} size={35} />
          </button>

          {/* favourites button - only show when there are favorites */}
          {favourites.length > 0 && (
            <Link to="/favourites" className="favourite truncate ml-2 h-10 bg-gray-700 hover:bg-gray-800 px-4 cursor-pointer rounded flex items-center gap-2">
              Favourite GIFs
              <span className="ml-1 bg-[tomato] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {favourites.length}
              </span>
            </Link>
          )}
          <button onClick={() => setShowCategories(!showCategories)}>
            <HiMiniBars3BottomRight className='text-sky-400 block lg:hidden' size={30} />
          </button>
        </div>

        {/* categories popup */}
        {
          showCategories && (
            <div className='absolute right-0 top-14 px-10 pt-6 pb-9 w-full gradient-menu z-20'>
              <span className='text-3xl font-extrabold'>Categories</span>
              <hr className='bg-gray-100 opacity-50 my-5' />
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'>
                {
                  categories?.map((category) => {
                    return (
                      <button
                        className='font-bold text-left'
                        key={category.name}
                        onClick={() => handleCategoryClick(category)}
                      >
                        {category.name}
                      </button>
                    )
                  })
                }
              </div>
            </div>
          )
        }
      </div>

      {/* search */}
      <SearchBar />
    </nav>
  )
}

export default Header;