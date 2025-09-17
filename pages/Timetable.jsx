import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetableGenerator() {
  const [daysoff, setDaysoff] = useState([]);
  const [timetables, setTimetables] = useState([]);

  const toggleDay = (day) => {
    setDaysoff((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const fetchTimetables = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/timetables", {
        daysoff: daysoff.join(","),
      });
      setTimetables(response.data.data || []);
    } catch (error) {
      console.error("Error fetching timetables:", error);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Timetable Generator</h1>

      {/* Day filter */}
      <div className="flex flex-wrap gap-4 mb-6">
        {DAYS.map((day) => (
          <label key={day} className="flex items-center gap-2">
            <Checkbox
              checked={daysoff.includes(day)}
              onCheckedChange={() => toggleDay(day)}
            />
            <span>{day}</span>
          </label>
        ))}
      </div>

      <Button onClick={fetchTimetables}>Generate Timetables</Button>

      {/* Results */}
      <div className="mt-8 grid gap-6">
        {timetables.map((tt) => (
          <Card key={tt.id} className="shadow-md">
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-2">Timetable #{tt.id}</h2>
              <div className="grid gap-3">
                {tt.courses.map((course, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-gray-50">
                    <h3 className="font-medium">{course.name} ({course.section})</h3>
                    <p className="text-sm text-gray-600">
                      Teacher: {course.teacher || "TBA"}
                    </p>
                    <ul className="mt-2 text-sm space-y-1">
                      {course.schedule.map((slot, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{slot.day}</span>
                          <span>{slot.time}</span>
                          <span>{slot.room}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
