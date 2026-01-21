import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { BACKGROUNDS } from '../../types/character';

export function Step5Background() {
  const { character, setBackground, nextStep, prevStep } = useCharacterStore();
  const [background, setBackgroundLocal] = useState(character.background);
  const [personalityTraits, setPersonalityTraits] = useState(character.personalityTraits);
  const [ideals, setIdeals] = useState(character.ideals);
  const [bonds, setBonds] = useState(character.bonds);
  const [flaws, setFlaws] = useState(character.flaws);

  useEffect(() => {
    setBackground({
      background,
      personalityTraits,
      ideals,
      bonds,
      flaws,
    });
  }, [background, personalityTraits, ideals, bonds, flaws, setBackground]);

  const isValid = background.length > 0;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Background</h2>
      <p className="step-description">
        Your background reveals where you came from and your place in the world.
      </p>

      <div className="form-group">
        <label>
          Background <span className="required">*</span>
        </label>
        <select
          value={background}
          onChange={(e) => setBackgroundLocal(e.target.value)}
        >
          <option value="">Select a background</option>
          {BACKGROUNDS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Personality Traits</label>
        <textarea
          value={personalityTraits}
          onChange={(e) => setPersonalityTraits(e.target.value)}
          placeholder="Describe your character's personality traits..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Ideals</label>
          <textarea
            value={ideals}
            onChange={(e) => setIdeals(e.target.value)}
            placeholder="What does your character believe in?"
          />
        </div>

        <div className="form-group">
          <label>Bonds</label>
          <textarea
            value={bonds}
            onChange={(e) => setBonds(e.target.value)}
            placeholder="What connections does your character have?"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Flaws</label>
        <textarea
          value={flaws}
          onChange={(e) => setFlaws(e.target.value)}
          placeholder="What are your character's weaknesses?"
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
