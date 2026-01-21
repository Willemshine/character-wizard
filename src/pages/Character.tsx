import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import './Character.css'

export function Character() {
  const navigate = useNavigate()
  const character = useCharacterStore((state) => state.character)

  return (
    <div className="character-page">
      <header className="character-header">
        <button className="back-button" onClick={() => navigate('/')}>
          Back
        </button>
        <h1>{character ? character.name : 'New Character'}</h1>
      </header>

      <div className="character-content">
        {character ? (
          <div className="character-sheet">
            <section className="character-section">
              <h2>Basic Info</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Name</label>
                  <span>{character.name}</span>
                </div>
                <div className="info-item">
                  <label>Race</label>
                  <span>{character.race}</span>
                </div>
                <div className="info-item">
                  <label>Class</label>
                  <span>{character.class}</span>
                </div>
                <div className="info-item">
                  <label>Level</label>
                  <span>{character.level}</span>
                </div>
              </div>
            </section>

            <section className="character-section">
              <h2>Attributes</h2>
              <div className="attributes-grid">
                {Object.entries(character.attributes).map(([key, value]) => (
                  <div key={key} className="attribute-item">
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <span className="attribute-value">{value}</span>
                    <span className="attribute-modifier">
                      {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}
                      {Math.floor((value - 10) / 2)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="no-character">
            <p>Character creation wizard coming soon...</p>
            <p className="hint">
              Upload a character JSON file from the start screen to view it here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
