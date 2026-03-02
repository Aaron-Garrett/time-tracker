import { useRef, useState, useEffect, useMemo } from 'react';
import './App.css';
import * as xlsx from 'xlsx';

function App() {
  const [timeEntries, setTimeEntries] = useState([]);
  const [statusMessage, setStatusMessage] = useState('No workbook connected.');
  const activities = [
    'Autonomous Ops',
    'Software Development',
    'Consulting',
    'Architecting',
    'Personal',
    'Planning',
    'FinOps',
    'Meetings',
    'Social Events',
    'Other'
  ];
  const gradients = [
    { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', shadow: 'rgba(102, 126, 234, 0.4)' },
    { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', shadow: 'rgba(245, 87, 108, 0.4)' },
    { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', shadow: 'rgba(79, 172, 254, 0.4)' },
    { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', shadow: 'rgba(67, 233, 123, 0.4)' },
    { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', shadow: 'rgba(250, 112, 154, 0.4)' },
    { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', shadow: 'rgba(48, 207, 208, 0.4)' },
    { bg: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', shadow: 'rgba(255, 94, 98, 0.4)' },
    { bg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', shadow: 'rgba(0, 198, 255, 0.4)' },
    { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', shadow: 'rgba(168, 237, 234, 0.4)' },
    { bg: 'linear-gradient(135deg, #ffccaa 0%, #bd2846 100%)', shadow: 'rgba(255, 154, 86, 0.4)' },
    { bg: 'linear-gradient(135deg, #2e2e78 0%, #662d91 100%)', shadow: 'rgba(46, 46, 120, 0.4)' },
    { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', shadow: 'rgba(252, 182, 159, 0.4)' },
    { bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)', shadow: 'rgba(161, 196, 253, 0.4)' },
    { bg: 'linear-gradient(135deg, #ffaeae 0%, #ee5a6f 100%)', shadow: 'rgba(255, 107, 107, 0.4)' },
    { bg: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)', shadow: 'rgba(78, 205, 196, 0.4)' },
    { bg: 'linear-gradient(135deg, #f38181 0%, #aa96da 100%)', shadow: 'rgba(243, 129, 129, 0.4)' },
    { bg: 'linear-gradient(135deg, #5f72bd 0%, #9921e8 100%)', shadow: 'rgba(95, 114, 189, 0.4)' },
    { bg: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)', shadow: 'rgba(196, 113, 245, 0.4)' },
  ];

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
          {activities.map((activity, index) => {
            const minutes = activityTotals[activity] || 0;
            const gradient = gradients[index % gradients.length];

            return (
              <button
                key={activity}
                className={`activity-button`} // add active class
                onClick={() => {
                  handleActivityClick(activity);
                }}
                style={{
                  background: gradient.bg,
                  boxShadow: `0 4px 15px ${gradient.shadow}`,
                }}
              >
                <div>{activity}</div>
                <div className="activity-total">{formatMinutes(minutes)}</div>
              </button>
            );
          })}
        </div>
        <button className="stop-button" onClick={() => closeDay()}>Stop</button>
      </main >
    </div >
  );
}

export default App;
