import { useRef, useState, useEffect, useMemo } from 'react';
import './App.css';
import * as xlsx from 'xlsx';

function App() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('No workbook connected.');

  const handleActivityClick = async (activityId) => {
    console.log(`Activity button clicked: ${activityId}`);
    let most_recent = timeEntries.length > 0 ? timeEntries[timeEntries.length - 1] : null;
    if (most_recent && !most_recent.endTime) {
      most_recent.endTime = new Date().toISOString();
    }
    const newEntry = {
      activity: activityId,
      startTime: new Date().toISOString(),
      endTime: null,
    };
    setTimeEntries([...timeEntries, newEntry]);
  }

  useEffect(() => {
    if (timeEntries.length === 0) return;

    console.log('Time entries updated:', timeEntries);
  }, [timeEntries]);

  const closeDay = async () => {
    if (timeEntries.length === 0) return;

    const updatedEntries = [...timeEntries];
    const lastEntry = updatedEntries[updatedEntries.length - 1];

    if (lastEntry && !lastEntry.endTime) {
      lastEntry.endTime = new Date().toISOString();
    }

    if (window.electronAPI && window.electronAPI.updateExcel) {
      const result = await window.electronAPI.updateExcel(updatedEntries);
      setStatusMessage(result);
    } else {
      console.warn("Electron API not available. Skipping Excel save.");
      setStatusMessage("Electron not detected — running in browser.");
    }

    setTimeEntries([]);
  };

  const calculateDurationMinutes = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(); // if running, use now
    return (end - start) / (1000 * 60);
  };

  const activityTotals = useMemo(() => {
    const totals = {};

    timeEntries.forEach(entry => {
      const duration = calculateDurationMinutes(entry.startTime, entry.endTime);

      if (!totals[entry.activity]) {
        totals[entry.activity] = 0;
      }

      totals[entry.activity] += duration;
    });

    return totals;
  }, [timeEntries]);

  const totalMinutes = useMemo(() => {
    return Object.values(activityTotals)
      .reduce((sum, val) => sum + val, 0);
  }, [activityTotals]);

  const activities = [
    'Autonomous Ops',
    'Software Development',
    'Consulting',
    'Architecting',
    'Personal',
    'Other'
  ];

  const formatMinutes = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Time Tracker</h1>
      </header>
      <main>
        <div className="activity-grid">
          {activities.map((activity) => {
            const minutes = activityTotals[activity] || 0;

            return (
              <button
                key={activity}
                className="activity-button"
                onClick={() => handleActivityClick(activity)}
              >
                <div>{activity}</div>
                <div className="activity-total">
                  {formatMinutes(minutes)}
                </div>
              </button>
            );
          })}
        </div>
        <button className="stop-button" onClick={() => closeDay()}>Stop</button>
      </main>
    </div>
  );
}

export default App;
