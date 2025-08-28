import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignupForm from './SignupForm'


export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 grid place-items-center p-4">
      <SignupForm />
    </div>
  );
}
