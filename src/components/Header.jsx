import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { HiEllipsisVertical, HiMiniBars3BottomRight } from "react-icons/hi2";
import { useGif } from './../context/GifContext';
import SearchBar from './SearchBar';

const Header = () => {

  const navigate = useNavigate();
  const { giphy, gifs, setGifs, favourites } = useGif();
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  const handleCategoryClick = (category) => {
    setShowCategories(false);
    setTimeout(() => {
      navigate(`/${category.name}`);
    }, 0);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await giphy.categories();
      setCategories(data);
    }
    fetchCategories();
  }, [giphy])

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

          {/* favourites button */}
          {favourites.length > 0 &&
            (
              <button className="favourite truncate h-10 bg-gray-700 hover:bg-gray-800 px-4 cursor-pointer rounded">
                <Link to="/favourites">Favoutite GIFs</Link>
              </button>
            )
          }
          <button>
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
                      <Link className='font-bold' key={category.name} onClick={() => handleCategoryClick(category)}>
                        {category.name}
                      </Link>
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