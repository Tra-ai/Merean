import { useState } from "react";
import StudyApp from "./studyapp/App";
import LibraryApp from "./libraryapp/App";

type Mode = "study" | "library";

export default function App() {
  const [mode, setMode] = useState<Mode>("study");

  return (
    <div className="unified-root">
      <div className="unified-switch" role="navigation" aria-label="TRA sections">
        <button className={mode === "study" ? "active" : ""} onClick={() => setMode("study")}>
          📚 TRA APP
        </button>
        <button className={mode === "library" ? "active" : ""} onClick={() => setMode("library")}>
          📝 អក្សរសាស្ត្រ
        </button>
      </div>

      <div className="unified-app">
        {mode === "study" ? <StudyApp /> : <LibraryApp />}
      </div>
    </div>
  );
}
