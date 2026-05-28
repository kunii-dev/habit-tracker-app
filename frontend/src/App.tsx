import { useState } from "react";

function App() {
  const [completed, setCompleted] = useState(false);

  const toggleHabit = async () => {
    await fetch(
      "http://localhost:3000/habits/9555704e-5dfa-4760-96c8-c17f6b002213/toggle",
      {
        method: "POST",
      }
    );

    setCompleted(!completed);
  };

  console.log(completed);

  return (
    <div>
      <button onClick={toggleHabit}>
        {completed ? "☑" : "☐"}
      </button>
    </div>
  );
}

export default App;