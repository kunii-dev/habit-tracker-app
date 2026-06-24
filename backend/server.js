require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json());

//Supabaseと接続
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

//DBのhabitデータを変更する
//ユーザーが今日の習慣を完了し、
//ReactのonClickによって起動する
app.post("/habits/:habitId/toggle", async (req, res) => {
    const { habitId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    //DBから今日のログを取得
    const { data: existingLog, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("date", today)
        .maybeSingle()

    if (existingLog) {
        //ログがある場合はトグルを☑にする
        await supabase
            .from("habit_logs")
            .update({
                completed: !existingLog.completed,
            })
            .eq("id", existingLog.id);

    } else {
        //ログがない場合はログデータを新規作成
        await supabase
            .from("habit_logs")
            .insert({
                habit_id: habitId,
                date: today,
                completed: true,
            });
    }

    res.send("toggle ok");
});

//DBからhabitsとhabit_logを取得(Express←DB)
app.get("/habits", async (req, res) => {
    const today = new Date().toISOString().split("T")[0];

    const { data: habits } = await supabase
        .from("habits")
        .select("*");

    const { data: logs } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("date", today);

    //habitとhabit_logのcompletedを合体
    const habitsWithStatus = habits.map((habit) => {
        const log = logs.find(
            (log) => log.habit_id === habit.id
        );

        return {
            ...habit,
            completed: log ? log.completed : false,
        };
    });

    res.json(habitsWithStatus);
});

//新しいHabitの追加
//Reactからの送信をreq.bodyで受け取る(React→Express)
app.post("/habits", async (req, res) => {
    const { name } = req.body;

    const { data, error } = await supabase
        .from("habits")
        .insert({
            name: name,
            user_id: "00000000-0000-0000-0000-000000000000",
        });

    res.send("habit create ok");
});

//habitの削除
app.delete("/habits/:habitId", async (req, res) => {
    const { habitId } = req.params;

    // 関連するログを削除
    await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId);

    // 習慣を削除
    await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);

    res.send("delete ok");
});

app.listen(3000, () => {
    console.log("Server running");
});