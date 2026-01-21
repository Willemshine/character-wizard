import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { CLASSES } from '../../types/character';

export function Step3Class() {
  const { character, setClass, nextStep, prevStep } = useCharacterStore();
  const [characterClass, setCharacterClassLocal] = useState(character.characterClass);
  const [subclass, setSubclass] = useState(character.subclass);
  const [level, setLevel] = useState(character.level);

  useEffect(() => {
    setClass(characterClass, subclass, level);
  }, [characterClass, subclass, level, setClass]);

  const isValid = characterClass.length > 0 && level >= 1 && level <= 20;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Choose Your Class</h2>
      <p className="step-description">
        Your class defines your character's capabilities and role in the party.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label>
            Class <span className="required">*</span>
          </label>
          <select
            value={characterClass}
            onChange={(e) => setCharacterClassLocal(e.target.value)}
          >
            <option value="">Select a class</option>
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Level <span className="required">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Subclass</label>
        <input
          type="text"
          value={subclass}
          onChange={(e) => setSubclass(e.target.value)}
          placeholder="Enter subclass (optional, usually chosen at level 3)"
        />
      </div>

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
