import './App.css'
import Home from './components/Home'
import Navbar from './components/Navbar'

function App() {
  return (
    <div className='bg-zinc-800 h-[100vh] w-full'>
      <Navbar/>
      <Home/>
    </div>
  )
}

export default App
