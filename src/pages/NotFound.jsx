import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom';

const NotFound = ({ errorMessage }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const message = errorMessage ||
    (location.state && location.state.errorMessage) ||
    "Oops! Koi error aa gaya hai ya page nahi mila.";

  const handleRetry = () => {
    navigate(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <img src="/logo.svg" alt="Error" className="w-20 mb-6 animate-bounce" />
      <h1 className="text-4xl font-bold mb-2 text-pink-500">Kuchh galat ho gaya!</h1>
      <p className="text-lg text-gray-400 mb-6">{message}</p>
      <div className="flex gap-4">
        <button
          onClick={handleRetry}
          className="bg-gradient-to-tr from-teal-500 to-pink-500 text-white px-6 py-2 rounded font-semibold shadow hover:scale-105 transition"
        >
          Retry
        </button>
        <Link
          to="/"
          className="bg-gray-800 text-white px-6 py-2 rounded font-semibold shadow hover:bg-gray-700 transition"
        >
          Home Page
        </Link>
      </div>
      <div className="mt-8 text-sm text-gray-500">Agar yeh error baar-baar aa rahi hai, toh ho sakta hai API rate limit exceed ho gayi ho. Thodi der baad try karo ya page reload karo.</div>
    </div>
  )
}

export default NotFound