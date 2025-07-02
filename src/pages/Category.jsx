import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import FollowOn from '../components/FollowOn';

const Category = () => {

  const { category } = useParams();
  const { fetchCategories, searchGifs, filter } = useGif();
  const [categoryGifs, setCategoryGifs] = useState([]);

  useEffect(() => {
    fetchCategories();

    if (category) {
      searchGifs(category, {
        sort: "relevant",
        lang: "en",
        type: filter,
        limit: 20,
      }).then(data => {
        if (data) {
          setCategoryGifs(data);
        }
      });
    }

  }, [category, fetchCategories, searchGifs, filter]);

  return (
    <>
      <h2 className='text-5xl font-extrabold p-3'>{category} GIFs</h2>
      <div className='flex flex-col sm:flex-row gap-5 my-4'>
        <div className='w-full sm:w-72'>
          {
            categoryGifs && categoryGifs?.length > 0 && (
              <Gif gif={categoryGifs[0]} hover={false} />
            )
          }
          <span className="text-gray-400 text-sm pt-2">
            Don&apos;t tell it to me, Just GIF it to me!
          </span>
          <FollowOn />
          <div className="divider" />
        </div>
        <div>
          {
            categoryGifs && categoryGifs.length > 0 ? (
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
                {
                  categoryGifs?.slice(1)?.map((gif, index) => {
                    return (
                      <Gif gif={gif} key={`${gif?.id || 'category-gif'}-${index}`} />
                    )
                  })
                }
              </div>
            ) : (
              <div className="text-center p-8">
                <p className="text-xl">Loading {category} GIFs...</p>
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}

export default Category;