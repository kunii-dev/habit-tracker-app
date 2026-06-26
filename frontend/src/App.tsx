import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";

type Habit = {
  id: string;
  name: string;
  completed: boolean;
};

function App() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");
  const [editingHabitId, setEditingHabitId] =
    useState<string | null>(null);
  const [editingName, setEditingName] =
    useState("");

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

    try {
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

    } catch {
      toast.error("習慣の更新に失敗しました");
    }
  };

  //新しいHabitの追加（Expressへ送信）
  const addHabit = async () => {

    const trimmedName = name.trim();

    if (!trimmedName) {
      setName("");
      return;
    }

    try {
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
      toast.success("習慣を追加しました");
      setName("");

    } catch {
      toast.error("習慣の追加に失敗しました");
    }
  };

  //Habitの削除（Expressへ送信）
  const deleteHabit = async (habitId: string) => {

    const result = confirm("本当に削除しますか？");
    if (!result) {
      return;
    }

    try {
      await fetch(
        `http://localhost:3000/habits/${habitId}`,
        {
          method: "DELETE",
        }
      );

      await fetchHabits();
      toast.success("習慣を削除しました");

    } catch {
      toast.error("習慣の削除に失敗しました");
    }
  };

  //Habit名の編集
  const updateHabit = async (habitId: string) => {

    const trimmedName = editingName.trim();

    if (trimmedName === "") {
      return;
    }

    try {
      await fetch(
        `http://localhost:3000/habits/${habitId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        }
      );

      await fetchHabits();
      toast.success("習慣を更新しました");

      setEditingHabitId(null);
      setEditingName("");

    } catch {
      toast.error("習慣の更新に失敗しました");
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  return (
    <div>
      <Toaster />

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addHabit();
          }
        }}
      />

      <button onClick={addHabit} >
        追加
      </button>

      {habits.map((habit) => (
        <div key={habit.id}>
          <button onClick={() => toggleHabit(habit.id)}>
            {habit.completed ? "☑" : "☐"}
          </button>
          {editingHabitId === habit.id ? (
            <>
              <input
                value={editingName}
                onChange={(e) =>
                  setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateHabit(habit.id);
                  }
                }}
              />

              <button
                onClick={() => updateHabit(habit.id)}
              >
                保存
              </button>

              <button
                onClick={() => {
                  setEditingHabitId(null);
                  setEditingName("");
                }}>
                キャンセル
              </button>

            </>
          )
            : (
              <span>{habit.name}</span>
            )
          }

          {
            editingHabitId !== habit.id && (
              <button
                onClick={() => {
                  setEditingHabitId(habit.id);
                  setEditingName(habit.name);
                }}
              >
                編集
              </button>
            )
          }

          <button onClick={() => deleteHabit(habit.id)}>
            削除
          </button>
        </div>
      ))
      }
    </div >
  );
}

export default App;