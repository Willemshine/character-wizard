import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';

export function Step1BasicInfo() {
  const { character, setBasicInfo, nextStep } = useCharacterStore();
  const [name, setName] = useState(character.name);
  const [playerName, setPlayerName] = useState(character.playerName);

  useEffect(() => {
    setBasicInfo(name, playerName);
  }, [name, playerName, setBasicInfo]);

  const isValid = name.trim().length > 0;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Basic Information</h2>
      <p className="step-description">
        Let's start with the basics. What is your character's name?
      </p>

      <div className="form-group">
        <label>
          Character Name <span className="required">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          autoFocus
        />
      </div>

      <div className="form-group">
        <label>Player Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name (optional)"
        />
      </div>

      <div className="step-actions">
        <div />
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
