import React, { useState } from 'react'
import Navbar from './Components/Navbar/Navbar'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './Pages/Home/Home'
import Vedio from './Pages/Vedio/Vedio'




const router=createBrowserRouter([
  {path:'/',
    element:<Home /> 
   },
   {path:'/vedio/:categoryId/:vedioId/:input',
  element:<Vedio/>
   }
])

const App = () => {


  return (
    <div>

      {/* <Navbar /> */}
      <RouterProvider router={router}/>
    </div>
  )
}

export default App

// :categoryId/:vedioId