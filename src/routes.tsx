import { createBrowserRouter } from "react-router-dom";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import HomePage from "./pages/HomePage";

export const router=createBrowserRouter([
    {
        path:'/',
        element:<HomePage/>
    },
    {
        path:'/signup',
        element:<SignUpPage/>
    },
    {
        path:'/login',
        element:<LoginPage/>
    },
    {
        path:'/profile',
        element:<ProfilePage/>
    },
])