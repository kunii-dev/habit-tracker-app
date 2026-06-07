require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const app = express();
app.use(cors());

app.post("/habits/:habitId/toggle", async (req, res) => {
    const { habitId } = req.params;

    console.log(habitId);

    const today = new Date().toISOString().split("T")[0];

    const { data: existingLog, error } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("habit_id", habitId)
        .eq("date", today)
        .maybeSingle()

    console.log(existingLog);
    console.log(error);

    if (existingLog) {
        await supabase
            .from("habit_logs")
            .update({
                completed: !existingLog.completed,
            })
            .eq("id", existingLog.id);

        console.log("UPDATE DONE");

        const { data: updatedLog } = await supabase
            .from("habit_logs")
            .select("*")
            .eq("id", existingLog.id)
            .single();

        console.log(updatedLog);

    } else {
        await supabase
            .from("habit_logs")
            .insert({
                habit_id: habitId,
                date: today,
                completed: true,
            });

        console.log("INSERT DONE");
    }

    res.send("toggle ok");
});

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

app.get("/habits/:habitId", async (req, res) => {
    const { habitId } = req.params;

    const { data, error } = await supabase
        .from("habits")
        .select("*")
        .eq("id", habitId)
        .single();

    console.log(data);
    console.log(error);

    res.json(data);
});

//DB一覧取得
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