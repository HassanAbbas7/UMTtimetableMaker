import { useState, useEffect } from 'react'
import './Generator.css'
import { API_URL, WHATSAPP1, WHATSAPP2, LS_COURSES_KEY, LS_TEACHERS_KEY, TOKEN_KEY } from '../constants/constants';
import * as XLSX from "xlsx";


const Generator = () => {

  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysOff, setDaysOff] = useState(['Monday']);
  const [allSelected, setAllSelected] = useState(false)
  const [timingsOff, setTimingsOff] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownVisibleT, setIsDropdownVisibleT] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [token, setToken] = useState("");
  const [remainingRequests, setRemainingRequests] = useState(0);
  const [showCreditsButton, setShowCreditsButton] = useState(true);
  const [selected, setSelected] = useState("AI");
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timingOptions = [
    { label: "8:00 AM", value: 8 },
    { label: "9:30 AM", value: 9 },
    { label: "11:00 AM", value: 11 },
    { label: "12:30 PM", value: 12 },
    { label: "2:00 PM", value: 14 },
    { label: "3:30 PM", value: 15 },
    { label: "5:00 PM", value: 17 },
    { label: "6:30 PM", value: 18 },
  ];

  function flattenTimetable(data) {
    if (!data?.courses) return [];

    return data.courses.flatMap(course =>
      course.schedule.map(slot => ({
        "Course Name": course.name.trim(),
        "Section": course.section || "-",
        "Teacher": course.teacher,
        "Day": slot.day,
        "Time": slot.time,
        "Room": slot.room,
      }))
    );
  }



  function exportTimetableToExcel(apiData) {
    const rows = flattenTimetable(apiData);

    const worksheet = XLSX.utils.json_to_sheet(rows);

    // 👇 THIS FIXES COLUMN RESIZING
    worksheet["!cols"] = [
      { wch: 30 }, // Course Name
      { wch: 10 }, // Section
      { wch: 22 }, // Teacher
      { wch: 12 }, // Day
      { wch: 22 }, // Time
      { wch: 15 }, // Room
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Timetable");

    XLSX.writeFile(workbook, "timetable.xlsx");
  }

  const handleDayChange = (day) => {
    if (daysOff.includes(day)) {
      // if (daysOff.length < 2) {
      //   alert("Select at least one off day!");
      //   return
      // }
      setDaysOff(daysOff.filter(d => d !== day));
    } else {
      setDaysOff([...daysOff, day]);
    }
  };

  const handleTimingChange = (hour) => {
    if (timingsOff.includes(hour)) {
      setTimingsOff(timingsOff.filter(t => t !== hour));
    } else {
      setTimingsOff([...timingsOff, hour]);
    }
  };

  const handleCourseChange = (course) => {

    if (selectedCourses.includes(course)) {

      setSelectedCourses(selectedCourses.filter(c => c !== course));
    } else {
      if (selectedCourses.length > 9) {
        alert("Please select the courses you need, don't nuke my server 🙏")
        return
      }
      setSelectedCourses([...selectedCourses, course]);
    }
  };

  const handleTeacherChange = (teacher) => {
    if (selectedTeachers.includes(teacher)) {
      setSelectedTeachers(selectedTeachers.filter(t => t !== teacher));
    } else {
      setSelectedTeachers([...selectedTeachers, teacher]);
    }
  };

  const handleTokenChange = (e) => {
    setToken(e.target.value);
    localStorage.setItem(TOKEN_KEY, e.target.value);
    setShowCreditsButton(true);
    setRemainingRequests(null);
  }

  const fetchRemainingCredits = async () => {
    try {
      const res = await fetch(`${API_URL}/check-credits/${token.trim()}`);

      const data = await res.json();
      setRemainingRequests(data.remaining);
      setShowCreditsButton(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const storedCourses = localStorage.getItem(LS_COURSES_KEY);
    const storedTeachers = localStorage.getItem(LS_TEACHERS_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);

    if (storedToken) {
      setToken(storedToken);
    }

    console.log("Loading from localStorage:", { storedCourses, storedTeachers })
    
    if (storedCourses) {
      try {
        setSelectedCourses(JSON.parse(storedCourses));
      } catch (e) {
        console.log(e)
        localStorage.removeItem(LS_COURSES_KEY);
      }
    }

    if (storedTeachers) {
      try {
        setSelectedTeachers(JSON.parse(storedTeachers));
      } catch {
        localStorage.removeItem(LS_TEACHERS_KEY);
      }
    }
    
    setHasLoadedFromStorage(true);
  }, []);

  // Save selectedCourses to localStorage
  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem(LS_COURSES_KEY, JSON.stringify(selectedCourses));
    }
  }, [selectedCourses, hasLoadedFromStorage]);

  // Save selectedTeachers to localStorage
  useEffect(() => {
    if (hasLoadedFromStorage) {
      localStorage.setItem(LS_TEACHERS_KEY, JSON.stringify(selectedTeachers));
    }
  }, [selectedTeachers, hasLoadedFromStorage]);


  useEffect(() => {
    if (daysOff.length >= 5) {
      setAllSelected(true);
    }
    else {
      setAllSelected(false)
    }

  }, [daysOff])

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/get-courses`);
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        setAllCourses(data.courses);
        // setSelectedCourses(data.courses);    // default: all checked
      } catch (err) {
        console.error(err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    // Only fetch teachers if we have courses selected AND we've loaded from storage
    if (!hasLoadedFromStorage || selectedCourses.length === 0) return;

    const fetchTeachers = async () => {
      try {
        const response = await fetch(`${API_URL}/get-teachers`, {
          method: "POST", 
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courses: selectedCourses,
          })
        });
        if (!response.ok) throw new Error("Failed to fetch teachers");
        const data = await response.json();
        setAllTeachers(data.teachers);
        
        // Only auto-select all teachers if there are no cached teachers
        // This preserves user's teacher selections
        if (selectedTeachers.length === 0) {
          setSelectedTeachers(data.teachers);
        } else {
          // Filter selectedTeachers to only include teachers that are still available
          setSelectedTeachers(prev => 
            prev.filter(teacher => data.teachers.includes(teacher))
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchTeachers();
  }, [selectedCourses, hasLoadedFromStorage]);


  const fetchTimetables = async () => {

    if (allCourses.length > 0 && selectedCourses.length < 4) {
      alert("Please select more courses");
      return;
    }
    setLoading(true);
    setError(null);

    try {

      const response = await fetch(`${API_URL}/get-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token.trim()}` // Include token in Authorization header
        },
        body: JSON.stringify({
          daysoff: daysOff.join(','),
          timingsOff: timingsOff,
          courses: selectedCourses,
          teachers: selectedTeachers
        })
      });

      if (response.status === 429) {
        setLimitReached(true);
        setTimetables([]);
        return;
      }
      else {
        setLimitReached(false);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch timetables');
      }


      const data = await response.json();
      setTimetables(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>College Timetables {`For ${selected}`}</h1>
        <p>Make your desired time table in 10 seconds</p>

        <div className="whatsapp-help">
          <p>Buy Tokens: </p>
          <a
            href={`https://wa.me/${WHATSAPP1.split(' ').join('')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
            <span>{WHATSAPP1}</span>
          </a>

          <a
            href={`https://wa.me/${WHATSAPP2.split(' ').join('')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-link"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="whatsapp-icon"
            />
            <span>{WHATSAPP2}</span>
          </a>
        </div>
      </header>


      {(token) && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div className="credits-box">
              <h3>Your Token: </h3>
              <input
                type="text"
                value={token}
                onChange={handleTokenChange}
                placeholder="Enter token"
              />

              {showCreditsButton ? (
                <button
                  disabled={!token.trim()}
                  onClick={fetchRemainingCredits}
                >
                  Show remaining credits
                </button>
              ) : (
                <p className="credits-result">
                  Remaining credits: <strong>{remainingRequests}</strong>
                </p>
              )}

            </div>
          </div>

        </>
      )}

      <div className="course-buttons">
        {["AI", "ML", "DS", "SE"].map(item => (
          <button
            key={item}
            className={selected === item ? "active" : ""}
            onClick={() => setSelected(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="filters">
        {/* Day Off Filter */}
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

        {/* Timing Off Filter */}
        <h2>Select undesired timings</h2>
        <div className="timing-checkboxes">
          {timingOptions.map(t => (
            <label key={t.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={timingsOff.includes(t.value)}
                onChange={() => handleTimingChange(t.value)}
              />
              {t.label}
            </label>
          ))}
        </div>


        <div className="course-dropdown-container">
          {/* Clickable heading that toggles visibility */}
          <h2
            onClick={() => { setIsDropdownVisible(!isDropdownVisible) }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            className="dropdown-heading"
          >
            Selected Courses
            {/* Optional dropdown indicator */}
            <span style={{ marginLeft: '8px' }}>
              {isDropdownVisible ? '▼' : '►'}
            </span>
          </h2>

          {/* Dropdown content - only visible when isDropdownVisible is true */}
          {isDropdownVisible && (
            <div className="course-checkboxes dropdown-content">
              {allCourses.length === 0 ? (
                <p>Loading courses...</p>
              ) : (
                allCourses.map(course => (
                  <label key={course} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedCourses.includes(course)}
                      onChange={() => handleCourseChange(course)}
                    />
                    {course}
                  </label>
                ))
              )}
            </div>
          )}
        </div>


        <div className="teacher-dropdown-container">
          {/* Clickable heading that toggles visibility */}
          <h2
            onClick={() => { setIsDropdownVisibleT(!isDropdownVisibleT) }}
            style={{ cursor: 'pointer', userSelect: 'none' }}
            className="dropdown-heading"
          >
            Selected Teachers
            {/* Optional dropdown indicator */}
            <span style={{ marginLeft: '8px' }}>
              {isDropdownVisibleT ? '▼' : '►'}
            </span>
          </h2>

          {/* Dropdown content - only visible when isDropdownVisible is true */}
          {isDropdownVisibleT && (
            <div className="teachers-checkboxes dropdown-content">
              {allTeachers.length === 0 ? (
                <p>Loading teachers...</p>
              ) : (
                allTeachers.map(teacher => (
                  <label key={teacher} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedTeachers.includes(teacher)}
                      onChange={() => handleTeacherChange(teacher)}
                    />
                    {teacher}
                  </label>
                ))
              )}
            </div>
          )}
        </div>

        <button onClick={fetchTimetables} disabled={loading}>
          {loading ? 'Loading...' : 'Apply Filters'}
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {error && (
            <ErrorMessage error={error} />
          )}

          {limitReached ? (

            <LimitReached token={token} handleTokenChange={handleTokenChange} fetchTimetables={fetchTimetables} WHATSAPP1={WHATSAPP1} WHATSAPP2={WHATSAPP2} />
          ) : (
            <div className="timetables-container">
              {timetables.length === 0 && !allSelected ? (
                <p className="no-results">
                  No timetables match your filters. Try selecting fewer restrictions.
                </p>
              ) : (
                allSelected ? (
                  <h1>اوے زیادہ مستی نہ کر، یونیورسٹی نہیں آنا تو نہ آ</h1>
                ) : (
                  <>
                    {timetables.map(timetable => (
                      <Timetable key={timetable.id} data={timetable} exportTimetableToExcel={exportTimetableToExcel} />
                    ))}
                  </>
                )
              )}
            </div>
          )}
        </>
      )}

    </div>
  );
}

function Timetable({ data, exportTimetableToExcel }) {
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <button className="export-btn" onClick={() => exportTimetableToExcel(data)}>
          Download Excel
        </button>
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

const ErrorMessage = ({ error }) => (
  <div className="error-message">
    <p>Error: {error}</p>
    <p>
      Contact the developer to report this error:
      hassanabbas7881@gmail.com
    </p>
  </div>
)

const LimitReached = ({ token, handleTokenChange, fetchTimetables, WHATSAPP1, WHATSAPP2, remainingRequests }) => (
  (
    <div className="limit-card filters">
      <h2>🚫 {!token && <>Free tier </>} Request Limit Reached</h2>
      {(token && remainingRequests != null) ? (<p>
        You've reached your token limit.
        Enter a valid token below to continue viewing results.
      </p>) : (
        <><p>
          You have reached the maximum number of requests allowed for free users.
          Please buy a token from either of the WhatsApp numbers below to continue using the service
        </p>

          <div style={{ marginTop: '10px' }}>
            <h4>Buy Tokens: </h4>
            <a
              href={`https://wa.me/${WHATSAPP1.split(' ').join('')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="whatsapp-icon"
              />
              <span>{WHATSAPP1}</span>
            </a>

            <a
              href={`https://wa.me/${WHATSAPP2.split(' ').join('')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                alt="WhatsApp"
                className="whatsapp-icon"
              />
              <span>{WHATSAPP2}</span>
            </a>
          </div>
        </>


      )}

      <label className="token-label">
        Enter your token:
      </label>

      <input
        type="text"
        className="token-input"
        value={token}
        onChange={handleTokenChange}
        placeholder="e.g. X9A2K7QW"
      />

      <button
        disabled={!token.trim()}
        onClick={fetchTimetables}
      >
        Show Results
      </button>
    </div>
  )
)

const LoadingSpinner = () => (
  <div className="loading-wrapper">
    <div className="spinner"></div>
    <p>Loading timetables…</p>
  </div>
);


export default Generator;
