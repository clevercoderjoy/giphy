import { Outlet } from "react-router-dom"
import Header from './components/Header';
import Footer from './components/Footer';
import GifProvider from './context/GifContext';
import { ToastContainer } from 'react-toastify';

function App() {

  return (
    <GifProvider>
      <div className="bg-gray-950 text-white min-h-screen">
        <div className="container px-6 py-4 mx-auto">
          <Header />
          <Outlet />
          <Footer />
        </div>
      </div>
      <ToastContainer />
    </GifProvider>
  )
}

export default App
