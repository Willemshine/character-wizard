import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';

export function Step11Backstory() {
  const { character, setBackstory, nextStep, prevStep } = useCharacterStore();
  const [backstory, setBackstoryLocal] = useState(character.backstory);
  const [allies, setAllies] = useState(character.allies);
  const [enemies, setEnemies] = useState(character.enemies);

  useEffect(() => {
    setBackstory(backstory, allies, enemies);
  }, [backstory, allies, enemies, setBackstory]);

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="step">
      <h2 className="step-title">Backstory</h2>
      <p className="step-description">
        Tell the story of your character's past. What shaped them into who they are today?
      </p>

      <div className="form-group">
        <label>Character Backstory</label>
        <textarea
          value={backstory}
          onChange={(e) => setBackstoryLocal(e.target.value)}
          placeholder="Write your character's backstory here... Where were they born? What events shaped their life? Why did they become an adventurer?"
          style={{ minHeight: '200px' }}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Allies & Organizations</label>
          <textarea
            value={allies}
            onChange={(e) => setAllies(e.target.value)}
            placeholder="Who are your character's friends, allies, or organizations they belong to?"
          />
        </div>

        <div className="form-group">
          <label>Enemies & Rivals</label>
          <textarea
            value={enemies}
            onChange={(e) => setEnemies(e.target.value)}
            placeholder="Does your character have any enemies or rivals? What's the history?"
          />
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={prevStep}>
          Back
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          Review Character
        </button>
      </div>
    </div>
  );
}
