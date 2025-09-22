import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {Routes, Route} from 'react-router-dom'
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import html2canvas from 'html2canvas';

const App= ()=> {
  
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [daysOff, setDaysOff] = useState(['Monday']);
  const [allSelected, setAllSelected] = useState(false)
  const [timingsOff, setTimingsOff] = useState([]);
  const [allCourses, setAllCourses] = useState([]);      // all from server
  const [allTeachers, setAllTeachers] = useState([]); 
  const [selectedCourses, setSelectedCourses] = useState([]); // currently selected
  const [selectedTeachers, setSelectedTeachers] = useState([]); // currently selected
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownVisibleT, setIsDropdownVisibleT] = useState(false);
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
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
  const handleDayChange = (day) => {
    if (daysOff.includes(day)) {
      if (daysOff.length < 2){
        alert("Select at least one off day!");
        return
      }
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


  useEffect(()=>{
    if (daysOff.length >= 6){
      setAllSelected(true);
    }
    else{
      setAllSelected(false)
    }

  }, [daysOff])

  useEffect(() => {
  const fetchCourses = async () => {
    try {
      const response = await fetch('https://hassanabbasnaqvi.pythonanywhere.com/api/get-courses');
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setAllCourses(data.courses);         // assuming response = { courses: ["CC101","CC202",...] }
      setSelectedCourses(data.courses);    // default: all checked
    } catch (err) {
      console.error(err);
    }
  };
  fetchCourses();
}, []);

useEffect(() => {
  const fetchTeachers = async () => {
    try {
      const response = await fetch('https://hassanabbasnaqvi.pythonanywhere.com/api/get-teachers', {method: "POST", headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courses: selectedCourses,
        })
      });
      if (!response.ok) throw new Error("Failed to fetch courses");
      const data = await response.json();
      setAllTeachers(data.teachers);
      setSelectedTeachers(data.teachers)
    } catch (err) {
      console.error(err);
    }
  };
  fetchTeachers();
}, [selectedCourses]);


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
          daysoff: daysOff.join(','),
          timingsOff: timingsOff,
          courses: selectedCourses,
          teachers: selectedTeachers
        })
      });
      
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
        <h1>College Timetables</h1>
        <p>Select the days and timings you don't want to attend college</p>
      </header>
      
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
        onClick={()=>{setIsDropdownVisible(!isDropdownVisible)}}
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
        onClick={()=>{setIsDropdownVisibleT(!isDropdownVisibleT)}}
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
      
      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p>Contact the developer to report this error: hassanabbas7881@gmail.com</p>
        </div>
      )}
      
      <div className="timetables-container">
        {timetables.length === 0 && !loading ? (
          <p className="no-results">No timetables match your filters. Try selecting fewer restrictions.</p>
        ) : (
          allSelected? <><h1>اوے زیادہ مستی نہ کر، کالج نہیں آنا تو نہ آ</h1></> : <>{timetables.map(timetable => (
            <Timetable key={timetable.id} data={timetable} />
          ))}</>
          
        )}
      </div>
    </div>
  );
}

function Timetable({ data }) {
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


export default App;