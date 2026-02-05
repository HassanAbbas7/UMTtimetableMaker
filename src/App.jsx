import { Routes, Route } from "react-router-dom";
import ProgramSelector from "../pages/ProgramSelector";
import Generator from "../pages/Generator";

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProgramSelector />} />
      <Route path="/generator" element={<Generator />} />
    </Routes>
  );
}

export default App;
