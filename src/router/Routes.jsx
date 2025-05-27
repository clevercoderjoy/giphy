import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from './../pages/Home';
import Category from './../pages/Category';
import Search from './../pages/Search';
import Favourite from './../pages/Favourite';
import Gif from './../pages/Gif';
import NotFound from './../pages/NotFound';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/:category",
        element: <Category />
      },
      {
        path: "/search/:query",
        element: <Search />
      },
      {
        path: "/:type/:slug",
        element: <Gif />
      },
      {
        path: "favourites",
        element: <Favourite />
      },
      {
        path: "*",
        element: <NotFound />
      }
    ]
  }
])

export default router;