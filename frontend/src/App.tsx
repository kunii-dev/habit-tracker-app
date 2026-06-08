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

    // DBから取得した習慣一覧に
    // completed を追加してReactで管理する
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