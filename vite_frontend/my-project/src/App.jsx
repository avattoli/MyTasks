import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignupForm from './SignupForm'

import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom'
import HomePage from './HomePage'
import LoginPage from './LoginPage'
import Dashboard from './Dashboard'
import TeamDetail from './TeamDetail'

function DashboardRoute() {
  const navigate = useNavigate();
  return (
    <Dashboard
      onOpenTeam={(team) => {
        const slug = team?.slug || String(team?._id || '').trim();
        if (slug) navigate(`/team/${slug}`);
      }}
    />
  );
}

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
  element: <DashboardRoute />
},
{
  path: '/team/:slug',
  element: <TeamDetail />
}])
export default function App() {
  return (
    <RouterProvider router={router} />
  );
}
