import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route} from 'react-router-dom'
import Timetable from '../pages/Timetable'
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Routes>
      <Route path='/' exact element={<Timetable/>} ></Route>

    </Routes>
    </>
  )
}

export default App
