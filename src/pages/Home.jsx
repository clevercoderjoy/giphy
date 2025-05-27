import React, { useEffect } from 'react'
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import Filters from '../components/Filters';

const Home = () => {

  const { giphy, gifs, setGifs, filter, setFilter, favourite } = useGif();

  useEffect(() => {
    const fetchTrendingGifs = async () => {
      const { data } = await giphy.trending({
        limit: 20,
        type: filter,
        rating: 'g',
      })
      setGifs(data);
    }
    fetchTrendingGifs();
  }, [filter, giphy, setGifs])

  return (
    <div>
      <img className='mt-2 rounded w-full' src="/banner.gif" alt="earth-banner" />

      <Filters alignLeft showTrending />

      <div className='columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2'>
        {
          gifs.map((gif) => {
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