import { useEffect, useState } from "react";

type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");

  //ExpressからDBデータの一覧を取得する
  const fetchHabits = async () => {
    const response = await fetch(
      "http://localhost:3000/habits"
    );

    const data = await response.json();

    setHabits(data);
  };

  //クリックした習慣ごとにトグルを連動させる
  const toggleHabit = async (habitId: string) => {
    await fetch(
      `http://localhost:3000/habits/${habitId}/toggle`,
      {
        method: "POST",
      }
    );

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

  //新しいHabitの追加（Expressへ送信）
  const addHabit = async () => {

    const trimmedName = name.trim();

    if (!trimmedName) {
      setName("");
      return;
    }

    await fetch(
      "http://localhost:3000/habits",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      }
    );

    await fetchHabits();
    setName("");
  };

  //Habitの削除（Expressへ送信）
  const deleteHabit = async (habitId: string) => {

    const result = confirm("本当に削除しますか？");
    if (!result) {
      return;
    }

    await fetch(
      `http://localhost:3000/habits/${habitId}`,
      {
        method: "DELETE",
      }
    );

    await fetchHabits();
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <button onClick={addHabit}>
        追加
      </button>

      {habits.map((habit) => (
        <div key={habit.id}>
          <button onClick={() => toggleHabit(habit.id)}>
            {habit.completed ? "☑" : "☐"} {habit.name}
          </button>

          <button onClick={() => deleteHabit(habit.id)}>
            削除
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;