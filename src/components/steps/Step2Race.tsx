import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { RACES, SUBRACES } from '../../types/character';

export function Step2Race() {
  const { character, setRace, nextStep, prevStep } = useCharacterStore();
  const [race, setRaceLocal] = useState(character.race);
  const [subrace, setSubrace] = useState(character.subrace);

  const availableSubraces = SUBRACES[race] || [];

  useEffect(() => {
    setRace(race, subrace);
  }, [race, subrace, setRace]);

  useEffect(() => {
    if (!availableSubraces.includes(subrace)) {
      setSubrace('');
    }
  }, [race, availableSubraces, subrace]);

  const isValid = race.length > 0;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Choose Your Race</h2>
      <p className="step-description">
        Your race determines many of your character's physical traits and some abilities.
      </p>

      <div className="form-group">
        <label>
          Race <span className="required">*</span>
        </label>
        <select
          value={race}
          onChange={(e) => setRaceLocal(e.target.value)}
        >
          <option value="">Select a race</option>
          {RACES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {availableSubraces.length > 0 && (
        <div className="form-group">
          <label>Subrace</label>
          <select
            value={subrace}
            onChange={(e) => setSubrace(e.target.value)}
          >
            <option value="">Select a subrace (optional)</option>
            {availableSubraces.map((sr) => (
              <option key={sr} value={sr}>
                {sr}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!isValid}
        >
          Next
        </button>
      </div>
    </div>
  );
}
