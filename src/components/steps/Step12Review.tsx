import { useCharacterStore } from '../../store/characterStore';
import type { AbilityScores } from '../../types/character';

const ABILITY_LABELS: Record<keyof AbilityScores, string> = {
  strength: 'Strength',
  dexterity: 'Dexterity',
  constitution: 'Constitution',
  intelligence: 'Intelligence',
  wisdom: 'Wisdom',
  charisma: 'Charisma',
};

function calculateModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function Step12Review() {
  const { character, prevStep, resetCharacter, setCurrentStep } = useCharacterStore();

  const handleFinish = () => {
    const characterJson = JSON.stringify(character, null, 2);
    const blob = new Blob([characterJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${character.name || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartOver = () => {
    if (confirm('Are you sure you want to start over? All progress will be lost.')) {
      resetCharacter();
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="step">
      <h2 className="step-title">Character Review</h2>
      <p className="step-description">
        Review your character before finalizing. Click any section to edit.
      </p>

      <div className="review-grid">
        {/* Basic Info */}
        <div className="review-section" onClick={() => goToStep(0)} style={{ cursor: 'pointer' }}>
          <h3>Basic Info</h3>
          <p><span className="label">Name:</span> <span className="value">{character.name || '—'}</span></p>
          <p><span className="label">Player:</span> <span className="value">{character.playerName || '—'}</span></p>
        </div>

        {/* Race */}
        <div className="review-section" onClick={() => goToStep(1)} style={{ cursor: 'pointer' }}>
          <h3>Race</h3>
          <p><span className="label">Race:</span> <span className="value">{character.race || '—'}</span></p>
          {character.subrace && (
            <p><span className="label">Subrace:</span> <span className="value">{character.subrace}</span></p>
          )}
        </div>

        {/* Class */}
        <div className="review-section" onClick={() => goToStep(2)} style={{ cursor: 'pointer' }}>
          <h3>Class</h3>
          <p><span className="label">Class:</span> <span className="value">{character.characterClass || '—'}</span></p>
          <p><span className="label">Level:</span> <span className="value">{character.level}</span></p>
          {character.subclass && (
            <p><span className="label">Subclass:</span> <span className="value">{character.subclass}</span></p>
          )}
        </div>

        {/* Background */}
        <div className="review-section" onClick={() => goToStep(4)} style={{ cursor: 'pointer' }}>
          <h3>Background</h3>
          <p><span className="label">Background:</span> <span className="value">{character.background || '—'}</span></p>
        </div>
      </div>

      {/* Ability Scores */}
      <div className="review-section" onClick={() => goToStep(3)} style={{ cursor: 'pointer' }}>
        <h3>Ability Scores</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
          {(Object.keys(character.abilityScores) as (keyof AbilityScores)[]).map((ability) => (
            <div key={ability} style={{ textAlign: 'center', minWidth: '80px' }}>
              <div style={{ fontWeight: 600, color: '#6366f1' }}>
                {character.abilityScores[ability]}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {ABILITY_LABELS[ability]} ({calculateModifier(character.abilityScores[ability])})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="review-section" onClick={() => goToStep(5)} style={{ cursor: 'pointer' }}>
        <h3>Skills</h3>
        {character.skills.length > 0 ? (
          <div className="tag-list">
            {character.skills.map((skill) => (
              <span key={skill} className="tag">{skill}</span>
            ))}
          </div>
        ) : (
          <p className="value">No skills selected</p>
        )}
      </div>

      {/* Equipment */}
      <div className="review-section" onClick={() => goToStep(6)} style={{ cursor: 'pointer' }}>
        <h3>Equipment</h3>
        <p><span className="label">Gold:</span> <span className="value">{character.gold} gp</span></p>
        {character.equipment.length > 0 ? (
          <div className="tag-list">
            {character.equipment.map((item) => (
              <span key={item} className="tag">{item}</span>
            ))}
          </div>
        ) : (
          <p className="value">No equipment selected</p>
        )}
      </div>

      {/* Spells */}
      {(character.cantrips.length > 0 || character.spells.length > 0) && (
        <div className="review-section" onClick={() => goToStep(7)} style={{ cursor: 'pointer' }}>
          <h3>Spells</h3>
          {character.cantrips.length > 0 && (
            <>
              <p className="label">Cantrips:</p>
              <div className="tag-list">
                {character.cantrips.map((cantrip) => (
                  <span key={cantrip} className="tag">{cantrip}</span>
                ))}
              </div>
            </>
          )}
          {character.spells.length > 0 && (
            <>
              <p className="label" style={{ marginTop: '0.5rem' }}>Spells:</p>
              <div className="tag-list">
                {character.spells.map((spell) => (
                  <span key={spell} className="tag">{spell}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Features & Traits */}
      {(character.features.length > 0 || character.traits.length > 0) && (
        <div className="review-section" onClick={() => goToStep(8)} style={{ cursor: 'pointer' }}>
          <h3>Features & Traits</h3>
          {character.features.length > 0 && (
            <>
              <p className="label">Features:</p>
              <div className="tag-list">
                {character.features.map((feature) => (
                  <span key={feature} className="tag">{feature}</span>
                ))}
              </div>
            </>
          )}
          {character.traits.length > 0 && (
            <>
              <p className="label" style={{ marginTop: '0.5rem' }}>Traits:</p>
              <div className="tag-list">
                {character.traits.map((trait) => (
                  <span key={trait} className="tag">{trait}</span>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Appearance */}
      <div className="review-section" onClick={() => goToStep(9)} style={{ cursor: 'pointer' }}>
        <h3>Appearance</h3>
        <div className="review-grid">
          <p><span className="label">Age:</span> <span className="value">{character.appearance.age || '—'}</span></p>
          <p><span className="label">Height:</span> <span className="value">{character.appearance.height || '—'}</span></p>
          <p><span className="label">Weight:</span> <span className="value">{character.appearance.weight || '—'}</span></p>
          <p><span className="label">Eyes:</span> <span className="value">{character.appearance.eyes || '—'}</span></p>
          <p><span className="label">Skin:</span> <span className="value">{character.appearance.skin || '—'}</span></p>
          <p><span className="label">Hair:</span> <span className="value">{character.appearance.hair || '—'}</span></p>
        </div>
      </div>

      {/* Backstory */}
      <div className="review-section" onClick={() => goToStep(10)} style={{ cursor: 'pointer' }}>
        <h3>Backstory</h3>
        <p className="value" style={{ whiteSpace: 'pre-wrap' }}>
          {character.backstory || 'No backstory written'}
        </p>
        {character.allies && (
          <p style={{ marginTop: '0.5rem' }}>
            <span className="label">Allies:</span> <span className="value">{character.allies}</span>
          </p>
        )}
        {character.enemies && (
          <p>
            <span className="label">Enemies:</span> <span className="value">{character.enemies}</span>
          </p>
        )}
      </div>

      {/* Personality */}
      {(character.personalityTraits || character.ideals || character.bonds || character.flaws) && (
        <div className="review-section" onClick={() => goToStep(4)} style={{ cursor: 'pointer' }}>
          <h3>Personality</h3>
          {character.personalityTraits && (
            <p><span className="label">Traits:</span> <span className="value">{character.personalityTraits}</span></p>
          )}
          {character.ideals && (
            <p><span className="label">Ideals:</span> <span className="value">{character.ideals}</span></p>
          )}
          {character.bonds && (
            <p><span className="label">Bonds:</span> <span className="value">{character.bonds}</span></p>
          )}
          {character.flaws && (
            <p><span className="label">Flaws:</span> <span className="value">{character.flaws}</span></p>
          )}
        </div>
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-secondary" onClick={handleStartOver}>
            Start Over
          </button>
          <button className="btn btn-success" onClick={handleFinish}>
            Download Character
          </button>
        </div>
      </div>
    </div>
  );
}
