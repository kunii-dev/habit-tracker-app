import { useEffect, useState } from "react";


type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

function App() {
  const [completed, setCompleted] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);

  //クリックした習慣ごとにトグルを連動させる
  const toggleHabit = async (habitId: string) => {
    await fetch(
      `http://localhost:3000/habits/${habitId}/toggle`,
      {
        method: "POST",
      }
    );
    setCompleted(!completed);

    //クリックした習慣はトグル切り替え、他の習慣は切り替わらない
    setHabits(
      habits.map((habit) => {
        if (habit.id === habitId) {
          return {
            ...habit,
            completed: !habit.completed,
          };
        }

        return habit;
      })
    );
  };

  //DBデータの一覧を取得した
  const fetchHabits = async () => {
    const response = await fetch(
      "http://localhost:3000/habits"
    );

    const data = await response.json();

    console.log(data);

    const newHabits = [];

    //箱を作り、箱にDB取得データを入れた
    //箱にはcompletedのデータも追加した
    for (const habit of data) {
      newHabits.push({
        id: habit.id,
        name: habit.name,
        completed: false,
      });
    }

    setHabits(newHabits);
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
    fetchHabits();
  }, []);

  return (
    <div>
      {habits.map((habit) => (
        <button
          key={habit.id}
          onClick={() => toggleHabit(habit.id)}
        >
          {habit.completed ? "☑" : "☐"} {habit.name}
        </button>
      ))}
    </div>
  );
}

export default App;