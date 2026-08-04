import { useEffect, useMemo, useState } from 'react';

const zones = [
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const timezoneLabels = {
  UTC: 'Coordinated Universal Time',
  'Europe/London': 'London',
  'Europe/Paris': 'Paris',
  'America/New_York': 'New York',
  'America/Los_Angeles': 'Los Angeles',
  'Asia/Tokyo': 'Tokyo',
  'Asia/Kolkata': 'Kolkata',
  'Australia/Sydney': 'Sydney',
  'Pacific/Auckland': 'Auckland'
};

const formatWithPadding = (value) => String(value).padStart(2, '0');

const getOffsetText = (offsetString) => {
  if (!offsetString) return '+00:00';
  const match = offsetString.match(/([+-]\d{2}:\d{2})$/);
  return match ? match[1] : offsetString;
};

const getTimeParts = ({ date, timeZone, use24 }) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: !use24,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') {
      acc[part.type] = part.value;
    }
    return acc;
  }, {});
};

const getZoneOffset = ({ date, timeZone }) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    timeZoneName: 'shortOffset'
  }).formatToParts(date);
  return getOffsetText(parts.find((part) => part.type === 'timeZoneName')?.value);
};

function App() {
  const [timeZone, setTimeZone] = useState('UTC');
  const [use24Hour, setUse24Hour] = useState(true);
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState('night');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeParts = useMemo(
    () => getTimeParts({ date: now, timeZone, use24: use24Hour }),
    [now, timeZone, use24Hour]
  );

  const offsetText = useMemo(() => getZoneOffset({ date: now, timeZone }), [now, timeZone]);

  const seconds = Number(timeParts.second || '0');
  const minutes = Number(timeParts.minute || '0') + seconds / 60;
  const hours = (Number(timeParts.hour || '0') % 12) + minutes / 60;
  const analogHour = use24Hour ? Number(timeParts.hour || '0') + minutes / 60 : hours;

  const themeClasses = {
    morning: {
      background: 'radial-gradient(circle at top, rgba(255, 211, 122, 0.18), transparent 30%), linear-gradient(180deg, #15233d 0%, #081426 100%)',
      accent: '#ffca5b'
    },
    night: {
      background: 'radial-gradient(circle at top, rgba(88,199,255,0.18), transparent 35%), linear-gradient(180deg, #0b1630 0%, #07101e 100%)',
      accent: '#58c7ff'
    }
  };

  useEffect(() => {
    document.body.style.background = themeClasses[theme].background;
    document.documentElement.style.setProperty('--accent', themeClasses[theme].accent);
  }, [theme]);

  const ticks = useMemo(
    () => Array.from({ length: 60 }, (_, i) => ({ index: i, large: i % 5 === 0 })),
    []
  );

  return (
    <div className="dashboard">
      <section className="panel">
        <div>
          <h1>React Clock Dashboard</h1>
          <p>Analog + digital time, timezone selection, 24h mode and dynamic theme.</p>
        </div>

        <div className="clock-frame" aria-label="Analog clock">
          <div className="clock-face">
            {ticks.map(({ index, large }) => (
              <span
                key={index}
                className={`tick ${large ? 'large' : 'small'}`}
                style={{ transform: `translateX(-50%) rotate(${index * 6}deg)` }}
              />
            ))}
          </div>
          <span className="hand hour" style={{ transform: `translateX(-50%) translateY(-10%) rotate(${analogHour * 30}deg)` }} />
          <span className="hand minute" style={{ transform: `translateX(-50%) translateY(-10%) rotate(${minutes * 6}deg)` }} />
          <span className="hand second" style={{ transform: `translateX(-50%) translateY(-10%) rotate(${seconds * 6}deg)` }} />
          <div className="hand-center" />
        </div>

        <div className="controls">
          <label>
            Time Zone
            <select value={timeZone} onChange={(event) => setTimeZone(event.target.value)}>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {timezoneLabels[zone]} ({zone})
                </option>
              ))}
            </select>
          </label>

          <label className="toggle" onClick={() => setUse24Hour((value) => !value)}>
            <span>24-Hour Format</span>
            <span className="switch">{use24Hour ? 'On' : 'Off'}</span>
          </label>

          <div className="theme-buttons">
            <button type="button" className="btn" onClick={() => setTheme('morning')}>
              Morning
            </button>
            <button type="button" className="btn" onClick={() => setTheme('night')}>
              Night
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="digital-card">
          <div className="digital-time">
            <strong>{`${timeParts.hour || '00'}:${timeParts.minute || '00'}:${timeParts.second || '00'}`}</strong>
            <div>
              <span className="digital-subtitle">{timeParts.weekday}, {timeParts.month} {timeParts.day}, {timeParts.year}</span>
              <span className="digital-subtitle">{timezoneLabels[timeZone]}</span>
            </div>
          </div>

          <div className="status-grid">
            <div className="status-card">
              <span>Current Zone</span>
              <strong>{timeZone}</strong>
            </div>
            <div className="status-card">
              <span>UTC Offset</span>
              <strong>{offsetText}</strong>
            </div>
            <div className="status-card">
              <span>Day of Week</span>
              <strong>{timeParts.weekday}</strong>
            </div>
            <div className="status-card">
              <span>Time Format</span>
              <strong>{use24Hour ? '24 Hour' : '12 Hour'}</strong>
            </div>
          </div>
        </div>

        <p className="footer">Open this page in the browser with `npm run dev`.</p>
      </section>
    </div>
  );
}

export default App;
