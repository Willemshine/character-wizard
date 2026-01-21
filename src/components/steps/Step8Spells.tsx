import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { CANTRIPS, SPELLS } from '../../types/character';

const SPELLCASTING_CLASSES = ['Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger', 'Sorcerer', 'Warlock', 'Wizard'];

export function Step8Spells() {
  const { character, setSpells, nextStep, prevStep } = useCharacterStore();
  const [cantrips, setCantripsLocal] = useState<string[]>(character.cantrips);
  const [spells, setSpellsLocal] = useState<string[]>(character.spells);

  const isSpellcaster = SPELLCASTING_CLASSES.includes(character.characterClass);

  useEffect(() => {
    setSpells(cantrips, spells);
  }, [cantrips, spells, setSpells]);

  const toggleCantrip = (cantrip: string) => {
    if (cantrips.includes(cantrip)) {
      setCantripsLocal(cantrips.filter((c) => c !== cantrip));
    } else if (cantrips.length < 3) {
      setCantripsLocal([...cantrips, cantrip]);
    }
  };

  const toggleSpell = (spell: string) => {
    if (spells.includes(spell)) {
      setSpellsLocal(spells.filter((s) => s !== spell));
    } else if (spells.length < 4) {
      setSpellsLocal([...spells, spell]);
    }
  };

  const handleNext = () => {
    nextStep();
  };

  if (!isSpellcaster) {
    return (
      <div className="step">
        <h2 className="step-title">Spells</h2>
        <p className="step-description">
          Your class ({character.characterClass || 'None selected'}) does not have spellcasting abilities.
          You can skip this step.
        </p>

        <div className="step-actions">
          <button className="btn btn-secondary" onClick={prevStep}>
            Back
          </button>
          <button className="btn btn-primary" onClick={handleNext}>
            Next
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="step">
      <h2 className="step-title">Spells</h2>
      <p className="step-description">
        Select your known cantrips and spells as a {character.characterClass}.
      </p>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Cantrips (up to 3)</h3>
      <div className={`points-remaining ${cantrips.length > 0 ? 'complete' : ''}`}>
        Cantrips Selected: <strong>{cantrips.length}</strong> / 3
      </div>
      <div className="checkbox-group">
        {CANTRIPS.map((cantrip) => (
          <label
            key={cantrip}
            className={`checkbox-item ${cantrips.includes(cantrip) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={cantrips.includes(cantrip)}
              onChange={() => toggleCantrip(cantrip)}
              disabled={!cantrips.includes(cantrip) && cantrips.length >= 3}
            />
            {cantrip}
          </label>
        ))}
      </div>

      <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>1st Level Spells (up to 4)</h3>
      <div className={`points-remaining ${spells.length > 0 ? 'complete' : ''}`}>
        Spells Selected: <strong>{spells.length}</strong> / 4
      </div>
      <div className="checkbox-group">
        {SPELLS.map((spell) => (
          <label
            key={spell}
            className={`checkbox-item ${spells.includes(spell) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={spells.includes(spell)}
              onChange={() => toggleSpell(spell)}
              disabled={!spells.includes(spell) && spells.length >= 4}
            />
            {spell}
          </label>
        ))}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
}
