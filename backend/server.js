require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());

//Supabase接続
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

//今日のログを更新して、習慣をトグル
app.post("/habits/:habitId/toggle", async (req, res) => {
    const { habitId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    //今日のログを取得
    const { data: existingLog, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("date", today)
        .maybeSingle()

    if (existingLog) {
        //ログがある場合は完了状態を反転
        await supabase
            .from("habit_logs")
            .update({
                completed: !existingLog.completed,
            })
            .eq("id", existingLog.id);

    } else {
        //ログがない場合は新規作成
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

//今日の完了状態を取得
app.get("/habits/:habitId/status", async (req, res) => {
    const { habitId } = req.params;
    const today = new Date().toISOString().split("T")[0];

    const { data: existingLog } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("date", today)
        .maybeSingle();

    res.json({
        completed: existingLog ? existingLog.completed : false,
    });
});

//DBから習慣一覧を取得
app.get("/habits", async (req, res) => {
    const { data, error } = await supabase
        .from("habits")
        .select("*");

    console.log(data);
    console.log(error);

    res.json(data);
});

app.listen(3000, () => {
    console.log("Server running");
});