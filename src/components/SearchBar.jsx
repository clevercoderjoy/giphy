import React, { useState } from 'react'
import { HiMiniXMark, HiOutlineMagnifyingGlass } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {

  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const searchGif = async () => {
    if (query.trim() === "") {
      navigate(`/`);
      return;
    }
    navigate(`/search/${query}`);
  }
  const handleEnterPress = (e) => {
    if (e.key === "Enter") {
      searchGif(query);
    }
  }

  return (
    <>
      <div className="flex relative">

        <input type="text" value={query} onKeyDown={(e) => handleEnterPress(e)} onChange={(e) => setQuery(e.target.value)} placeholder='Search all the GIFs, texts and stikers' className='w-full pl-4 pr-14 py-5 text-xl bg-white text-black rounded-tl rounded-bl border border-gray-300 outline-none' />

        {
          query && (
            <button onClick={() => setQuery("")} className='absolute bg-gray-300 opacity-90 rounded-full right-20 mr-2 top-6'>
              <HiMiniXMark size={25} />
            </button>
          )
        }

        <button onClick={searchGif} className='bg-gradient-to-tr from-pink-600 to-pink-400 text-white px-2 py-2 rounded-tr rounded-br' >
          <HiOutlineMagnifyingGlass size={35} className='-scale-x-100' />
        </button>
      </div>
    </>
  )
}

export default SearchBar;