import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useGif } from '../context/GifContext';
import Gif from '../components/Gif';
import FollowOn from '../components/FollowOn';

const Category = () => {

  const { category } = useParams();
  const { fetchCategories, categories } = useGif();

  useEffect(() => {
    if (category) {
      fetchCategories(category);
    }
    else {
      fetchCategories();
    }

  }, [category, fetchCategories]);

  console.log("categories", categories)

  return (
    <>
      <h2 className='text-5xl font-extrabold p-3'>{category} GIFs</h2>
      <div className='flex flex-col sm:flex-row gap-5 my-4'>
        <div className='w-full sm:w-72'>
          {
            categories && categories?.length > 0 && (
              <Gif gif={categories[0]} hover={false} />
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
            categories && categories.length > 0 && (
              <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2">
                {
                  categories?.slice(1)?.map((gif) => {
                    return (
                      <Gif gif={gif} key={gif.id} />
                    )
                  })
                }
              </div>
            )
          }
        </div>
      </div>
    </>
  )
}

export default Category;