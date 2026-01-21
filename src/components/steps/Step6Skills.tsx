import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { ALL_SKILLS } from '../../types/character';

const MAX_SKILLS = 4;

export function Step6Skills() {
  const { character, setSkills, nextStep, prevStep } = useCharacterStore();
  const [skills, setSkillsLocal] = useState<string[]>(character.skills);

  useEffect(() => {
    setSkills(skills);
  }, [skills, setSkills]);

  const toggleSkill = (skill: string) => {
    if (skills.includes(skill)) {
      setSkillsLocal(skills.filter((s) => s !== skill));
    } else if (skills.length < MAX_SKILLS) {
      setSkillsLocal([...skills, skill]);
    }
  };

  const isValid = skills.length >= 2;

  const handleNext = () => {
    if (isValid) {
      nextStep();
    }
  };

  return (
    <div className="step">
      <h2 className="step-title">Skills</h2>
      <p className="step-description">
        Choose your proficient skills (select 2-{MAX_SKILLS} skills).
      </p>

      <div className={`points-remaining ${skills.length >= 2 ? 'complete' : ''}`}>
        Skills Selected: <strong>{skills.length}</strong> / {MAX_SKILLS} (minimum 2)
      </div>

      <div className="checkbox-group">
        {ALL_SKILLS.map((skill) => (
          <label
            key={skill}
            className={`checkbox-item ${skills.includes(skill) ? 'selected' : ''}`}
          >
            <input
              type="checkbox"
              checked={skills.includes(skill)}
              onChange={() => toggleSkill(skill)}
              disabled={!skills.includes(skill) && skills.length >= MAX_SKILLS}
            />
            {skill}
          </label>
        ))}
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
