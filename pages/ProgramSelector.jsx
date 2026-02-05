import { useNavigate } from "react-router-dom";
import "./ProgramSelector.css";

const programs = ["AI", "DS", "SE", "CS"];

const ProgramSelector = () => {
  const navigate = useNavigate();

  const handleSelect = (program) => {
    navigate(`/generator?program=${program}`);
  };

  return (
    <div className="selector-container">
      <h1>Choose Your Program</h1>

      <div className="selector-grid">
        {programs.map((program) => (
          <button
            key={program}
            className="selector-btn"
            onClick={() => handleSelect(program)}
          >
            {program}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgramSelector;
