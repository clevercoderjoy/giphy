import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from './../pages/Home';
import Category from './../pages/Category';
import Search from './../pages/Search';
import Favourite from './../pages/Favourite';
import NotFound from './../pages/NotFound';
import SingleGif from "../pages/SingleGif";

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
        element: <SingleGif />
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