import React from "react";
import './Header.css'

const Header = ({ onGenerate, loading }) => {
  return (
    <header className="main-header">
      <div className="header-left">
        <h1>🎓 College Timetable Generator</h1>
        <p>
          Pick your off-days, avoid bad timings, and generate the best timetable
        </p>

        <div className="program-buttons">
          <a href="/ai" className="program-btn">AI</a>
          <a href="/ds" className="program-btn">DS</a>
          <a href="/software-engineering" className="program-btn">
            Software Engineering
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
