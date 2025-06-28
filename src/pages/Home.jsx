import React, { useEffect } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import Filters from '../components/Filters';

const Home = () => {

  const { trendingGifs, fetchTrending, filter } = useGif();

  useEffect(() => {
    fetchTrending({ limit: 20, type: filter });
  }, [fetchTrending, filter])

  return (
    <div>
      <img className='mt-2 rounded w-full' src="/banner.gif" alt="earth-banner" />

      <Filters alignLeft showTrending />

      <div className='columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2'>
        {
          trendingGifs.map((gif) => {
            return (
              <Gif key={gif?.title} gif={gif} />
            )
          })
        }
      </div>
    </div>
  )
}

export default Home