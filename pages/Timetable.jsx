import React, { useState, useEffect } from 'react';

const Pagee= ()=> {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysOff, setDaysOff] = useState([]);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayChange = (day) => {
    if (daysOff.includes(day)) {
      setDaysOff(daysOff.filter(d => d !== day));
    } else {
      setDaysOff([...daysOff, day]);
    }
  };

  const fetchTimetables = async () => {
    setLoading(true);
    setError(null);
    
    try {

      const response = await fetch('https://hassanabbasnaqvi.pythonanywhere.com/api/get-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          daysoff: daysOff.join(',')
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch timetables');
      }
      
      const data = await response.json();
      setTimetables(data.data);
    } catch (err) {
      setError(err.message);

      setTimetables(sampleResponse.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetables();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>College Timetables</h1>
        <p>Select the days you don't want to attend college</p>
      </header>
      
      <div className="filters">
        <h2>Filter by Days Off</h2>
        <div className="day-checkboxes">
          {daysOfWeek.map(day => (
            <label key={day} className="checkbox-label">
              <input
                type="checkbox"
                checked={daysOff.includes(day)}
                onChange={() => handleDayChange(day)}
              />
              {day}
            </label>
          ))}
        </div>
        <button onClick={fetchTimetables} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Showing sample data for demonstration</p>
        </div>
      )}
      
      <div className="timetables-container">
        {timetables.length === 0 && !loading ? (
          <p className="no-results">No timetables match your filters. Try selecting fewer days off.</p>
        ) : (
          timetables.map(timetable => (
            <Timetable key={timetable.id} data={timetable} />
          ))
        )}
      </div>
    </div>
  );
}

function Timetable({ data }) {
  // Group courses by day for better visualization
  const scheduleByDay = {};
  
  data.courses.forEach(course => {
    course.schedule.forEach(session => {
      if (!scheduleByDay[session.day]) {
        scheduleByDay[session.day] = [];
      }
      scheduleByDay[session.day].push({
        ...session,
        courseName: course.name,
        section: course.section,
        teacher: course.teacher
      });
    });
  });
  
  // Sort sessions by time within each day
  Object.keys(scheduleByDay).forEach(day => {
    scheduleByDay[day].sort((a, b) => {
      const timeToMinutes = (timeStr) => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':');
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };
      
      const aStartTime = timeToMinutes(a.time.split('-')[0]);
      const bStartTime = timeToMinutes(b.time.split('-')[0]);
      return aStartTime - bStartTime;
    });
  });

  const daysOrder = {
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6,
    'Sunday': 7
  };

  const sortedDays = Object.keys(scheduleByDay).sort((a, b) => daysOrder[a] - daysOrder[b]);

  return (
    <div className="timetable">
      <h2>Timetable Option #{data.id}</h2>
      <div className="days-container">
        {sortedDays.map(day => (
          <DaySchedule key={day} day={day} sessions={scheduleByDay[day]} />
        ))}
      </div>
    </div>
  );
}

function DaySchedule({ day, sessions }) {
  return (
    <div className="day-schedule">
      <h3>{day}</h3>
      <div className="sessions">
        {sessions.map((session, index) => (
          <div key={index} className="session-card">
            <h4>{session.courseName}</h4>
            <p>Section: {session.section}</p>
            <p>Time: {session.time}</p>
            <p>Room: {session.room}</p>
            {session.teacher && <p>Teacher: {session.teacher}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Sample response data for demonstration
const sampleResponse = {
  "data": [
    {
      "id": 1,
      "courses": [
        {
          "name": "CC213 - Data Structures -",
          "section": "A5",
          "teacher": "Ahmad Raza",
          "schedule": [
            {
              "day": "Thursday",
              "time": "03:30 PM-04:45 PM",
              "room": "SST1-701"
            },
            {
              "day": "Saturday",
              "time": "11:00 AM-12:15 PM",
              "room": "SST1-406A"
            }
          ]
        },
        {
          "name": "CC213L - Data Structures (Lab) -",
          "section": "A1",
          "teacher": "Jawad Hassan",
          "schedule": [
            {
              "day": "Friday",
              "time": "02:00 PM-03:15 PM",
              "room": "SST1-606"
            },
            {
              "day": "Friday",
              "time": "03:30 PM-04:45 PM",
              "room": "SST1-606"
            }
          ]
        },
        {
          "name": "CC222 - Computer Organization and Assembly Language -",
          "section": "A9",
          "teacher": "Ashraf Ali",
          "schedule": [
            {
              "day": "Tuesday",
              "time": "11:00 AM-12:15 PM",
              "room": "TBA"
            },
            {
              "day": "Thursday",
              "time": "02:00 PM-03:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "CC222L - Computer Organization and Assembly Language (Lab) -",
          "section": "A4",
          "teacher": "Ahmed Yar",
          "schedule": [
            {
              "day": "Saturday",
              "time": "08:00 AM-09:15 AM",
              "room": "SST1-606"
            },
            {
              "day": "Saturday",
              "time": "09:30 AM-10:45 AM",
              "room": "SST1-606"
            }
          ]
        },
        {
          "name": "CC281 - Software Engineering -",
          "section": "A7",
          "teacher": null,
          "schedule": [
            {
              "day": "Tuesday",
              "time": "08:00 AM-09:15 AM",
              "room": "TBA"
            },
            {
              "day": "Friday",
              "time": "11:00 AM-12:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "MA150 - Probability and Statistics -",
          "section": "A1",
          "teacher": null,
          "schedule": [
            {
              "day": "Tuesday",
              "time": "12:30 PM-01:45 PM",
              "room": "TBA"
            },
            {
              "day": "Saturday",
              "time": "02:00 PM-03:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "MA210 - Linear Algebra -",
          "section": "A2",
          "teacher": null,
          "schedule": [
            {
              "day": "Thursday",
              "time": "05:00 PM-06:15 PM",
              "room": "TBA"
            },
            {
              "day": "Saturday",
              "time": "12:30 PM-01:45 PM",
              "room": "TBA"
            }
          ]
        }
      ]
    },
    {
      "id": 2,
      "courses": [
        {
          "name": "CC213 - Data Structures -",
          "section": "A5",
          "teacher": "Ahmad Raza",
          "schedule": [
            {
              "day": "Thursday",
              "time": "03:30 PM-04:45 PM",
              "room": "SST1-701"
            },
            {
              "day": "Saturday",
              "time": "11:00 AM-12:15 PM",
              "room": "SST1-406A"
            }
          ]
        },
        {
          "name": "CC213L - Data Structures (Lab) -",
          "section": "A1",
          "teacher": "Jawad Hassan",
          "schedule": [
            {
              "day": "Friday",
              "time": "02:00 PM-03:15 PM",
              "room": "SST1-606"
            },
            {
              "day": "Friday",
              "time": "03:30 PM-04:45 PM",
              "room": "SST1-606"
            }
          ]
        },
        {
          "name": "CC222 - Computer Organization and Assembly Language -",
          "section": "A9",
          "teacher": "Ashraf Ali",
          "schedule": [
            {
              "day": "Tuesday",
              "time": "11:00 AM-12:15 PM",
              "room": "TBA"
            },
            {
              "day": "Thursday",
              "time": "02:00 PM-03:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "CC222L - Computer Organization and Assembly Language (Lab) -",
          "section": "A4",
          "teacher": "Ahmed Yar",
          "schedule": [
            {
              "day": "Saturday",
              "time": "08:00 AM-09:15 AM",
              "room": "SST1-606"
            },
            {
              "day": "Saturday",
              "time": "09:30 AM-10:45 AM",
              "room": "SST1-606"
            }
          ]
        },
        {
          "name": "CC281 - Software Engineering -",
          "section": "A7",
          "teacher": null,
          "schedule": [
            {
              "day": "Tuesday",
              "time": "08:00 AM-09:15 AM",
              "room": "TBA"
            },
            {
              "day": "Friday",
              "time": "11:00 AM-12:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "MA150 - Probability and Statistics -",
          "section": "A1",
          "teacher": null,
          "schedule": [
            {
              "day": "Tuesday",
              "time": "12:30 PM-01:45 PM",
              "room": "TBA"
            },
            {
              "day": "Saturday",
              "time": "02:00 PM-03:15 PM",
              "room": "TBA"
            }
          ]
        },
        {
          "name": "MA210 - Linear Algebra -",
          "section": "A7",
          "teacher": null,
          "schedule": [
            {
              "day": "Tuesday",
              "time": "03:30 PM-04:45 PM",
              "room": "TBA"
            },
            {
              "day": "Saturday",
              "time": "03:30 PM-04:45 PM",
              "room": "SST1-404A"
            }
          ]
        }
      ]
    }
  ]
};

export default Pagee;