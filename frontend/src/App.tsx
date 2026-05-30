import { useEffect, useState } from "react";

function App() {
  const [completed, setCompleted] = useState(false);
  const [habitName, setHabitName] = useState("");

  const toggleHabit = async () => {
    await fetch(
      "http://localhost:3000/habits/9555704e-5dfa-4760-96c8-c17f6b002213/toggle",
      {
        method: "POST",
      }
    );
    setCompleted(!completed);
  };

  const fetchHabit = async () => {
    const response = await fetch(
      "http://localhost:3000/habits/9555704e-5dfa-4760-96c8-c17f6b002213"
    );

    const data = await response.json();

    console.log(data);

    setHabitName(data.name);
  };

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch(
        "http://localhost:3000/habits/9555704e-5dfa-4760-96c8-c17f6b002213/status"
      );

      const data = await response.json();

      setCompleted(data.completed);
    };

    fetchStatus();
    fetchHabit();
  }, []);

  return (
    <div>
      <button onClick={toggleHabit}>
        {completed ? "☑" : "☐"}{habitName}
      </button>
    </div>
  );
}

export default App;