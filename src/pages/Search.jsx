import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGif } from '../context/GifContext';
import Filters from '../components/Filters';
import Gif from '../components/Gif';

const Search = () => {

  const { query } = useParams();
  const { giphy, filter } = useGif();

  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      const { data } = await giphy.search(query, {
        sort: "relevant",
        lang: "en",
        type: filter,
        limit: 20,
      });
      setSearchResults(data);
    }
    fetchSearchResults()
  }, [filter, giphy, query])

  console.log(searchResults)

  return (
    <>
      <div className='my-4'>
        <h2 className='text-5xl font-extrabold p-3'>{query}</h2>
        <Filters alignLeft={true} />
        {
          searchResults.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-2">
              {searchResults.map((gif) => (
                <Gif key={gif.id} gif={gif} />
              ))}
            </div>
          ) : (
            <span>No GIFs found for {query}.</span>
          )
        }
      </div>
    </>
  )
}

export default Search