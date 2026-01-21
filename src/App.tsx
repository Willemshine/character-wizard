import { Routes, Route } from 'react-router-dom'
import { StartScreen } from './pages/StartScreen'
import { Character } from './pages/Character'
import { Options } from './pages/Options'

function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/character" element={<Character />} />
      <Route path="/options" element={<Options />} />
    </Routes>
  )
}

export default App
