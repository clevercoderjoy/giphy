import { useGif } from '../context/GifContext'
import { HiMiniArrowTrendingUp } from 'react-icons/hi2';
import { filters } from '../data/filterData';

const Filters = ({ alignLeft = false, showTrending = false }) => {

  const { filter, setFilter } = useGif();

  return (
    <>
      <div className={`flex my-3 gap-3 ${alignLeft ? "" : "justify-end"} ${showTrending ? "justify-between flex-col sm:flex-row sm:items-center" : ""}`}>
        {
          showTrending && (
            <span className='flex gap-2'>
              {
                showTrending && (
                  <HiMiniArrowTrendingUp size={25} className='text-teal-400' />
                )
              }
              <span className='font-semibold text-gray-400'>Trending</span>
            </span>
          )
        }
        <div className='flex min-w-80 rounded-full bg-gray-800'>
          {
            filters.map((f) => {
              return (
                <span className={`font-semibold ${f.background} py-2 w-1/3 text-center rounded-full cursor-pointer ${filter === f.value ? "filter-style" : ""}`} key={f?.title} onClick={() => setFilter(f.value)}>{f?.title}</span>
              )
            })
          }
        </div>
      </div>
    </>
  )
}

export default Filters