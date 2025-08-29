import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignupForm from './SignupForm'

import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'

const router = createBrowserRouter([{
  path: '/',
  element: <HomePage />
},
{
  path: '/signup',
  element: <SignupForm />
},
{
  path: '/login',
  element: <LoginPage />
},
{
  path: '/dashboard',
  element: <Dashboard />
}])
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
