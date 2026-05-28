require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const express = require("express");

const app = express();

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

app.listen(3000, () => {
    console.log("Server running");
});