import { useNavigate } from 'react-router-dom'
import { useCharacterStore } from '../store/characterStore'
import './Options.css'

export function Options() {
  const navigate = useNavigate()
  const modulePacks = useCharacterStore((state) => state.modulePacks)
  const toggleModule = useCharacterStore((state) => state.toggleModule)

  return (
    <div className="options-page">
      <header className="options-header">
        <button className="back-button" onClick={() => navigate('/')}>
          Back
        </button>
        <h1>Options</h1>
      </header>

      <section className="module-section">
        <h2>Module Packs</h2>
        <p className="section-description">
          Enable or disable content modules for character creation
        </p>

        <div className="module-list">
          {modulePacks.map((pack) => (
            <div key={pack.id} className="module-item">
              <div className="module-info">
                <h3>{pack.name}</h3>
                <p>{pack.description}</p>
              </div>
              <label className="toggle">
                <input
                  type="checkbox"
                  checked={pack.enabled}
                  onChange={() => toggleModule(pack.id)}
                />
                <span className="toggle-slider" />
              </label>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
