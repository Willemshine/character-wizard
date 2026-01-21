import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CharacterSchema } from '../types/character'
import { useCharacterStore } from '../store/characterStore'
import './StartScreen.css'

export function StartScreen() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const setCharacter = useCharacterStore((state) => state.setCharacter)
  const [error, setError] = useState<string | null>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const text = await file.text()
      const json = JSON.parse(text)
      const result = CharacterSchema.safeParse(json)

      if (!result.success) {
        const errors = result.error.issues.map((issue) => issue.message).join(', ')
        setError(`Invalid character file: ${errors}`)
        return
      }

      setCharacter(result.data)
      navigate('/character')
    } catch {
      setError('Failed to parse file. Please upload a valid JSON file.')
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleNewCharacter = () => {
    setCharacter(null)
    navigate('/character')
  }

  const handleOptions = () => {
    navigate('/options')
  }

  return (
    <div className="start-screen">
      <h1>Character Wizard</h1>
      <p className="subtitle">Create and manage your RPG characters</p>

      <div className="button-group">
        <button className="primary-button" onClick={handleNewCharacter}>
          New Character
        </button>

        <button className="secondary-button" onClick={handleUploadClick}>
          Upload Character
        </button>

        <button className="secondary-button" onClick={handleOptions}>
          Options
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {error && <p className="error-message">{error}</p>}
    </div>
  )
}
