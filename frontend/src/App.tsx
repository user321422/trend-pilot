import './App.css'

const trendQueue = [
  {
    topic: 'AI search visibility for founder-led SaaS',
    source: 'Google Trends',
    score: 92,
    owner: 'Mira',
    status: 'Brief ready',
  },
  {
    topic: 'Reddit backlash against zero-click summaries',
    source: 'Reddit',
    score: 87,
    owner: 'Dev',
    status: 'Needs angle',
  },
  {
    topic: 'B2B newsletter benchmarks after inbox tabs update',
    source: 'News',
    score: 81,
    owner: 'Kian',
    status: 'Scoring',
  },
  {
    topic: 'Short-form webinar clips driving demo requests',
    source: 'Reddit',
    score: 76,
    owner: 'Ava',
    status: 'Assigned',
  },
]

const briefs = [
  { label: 'Generated', value: 18, change: '+6 today' },
  { label: 'Approved', value: 11, change: '4 awaiting edit' },
  { label: 'Assigned', value: 9, change: '2 due in 6h' },
  { label: 'Publish-ready', value: 5, change: '+3 queued' },
]

const reviewSignals = [
  { label: 'SEO coverage', value: '94%', tone: 'good' },
  { label: 'Readability', value: 'A-', tone: 'good' },
  { label: 'Brief match', value: '88%', tone: 'warn' },
  { label: 'Missing sections', value: '2', tone: 'risk' },
]

function App() {
  return (
    <main className="dashboard-shell">
      <aside className="sidebar" aria-label="TrendPilot navigation">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span>TrendPilot</span>
        </div>
        <nav className="nav-list">
          <a className="active" href="#overview">Dashboard</a>
          <a href="#trends">Trends</a>
          <a href="#briefs">Briefs</a>
          <a href="#writers">Writers</a>
          <a href="#review">Review</a>
        </nav>
        <div className="sidebar-summary">
          <span className="eyebrow">Next publish</span>
          <strong>Today, 4:30 PM</strong>
          <p>LinkedIn thread and X post are waiting on editor approval.</p>
        </div>
      </aside>

      <section className="workspace" id="overview">
        <header className="topbar">
          <div>
            <p className="eyebrow">Content operations</p>
            <h1>Dashboard</h1>
          </div>
          <div className="topbar-actions" aria-label="Dashboard actions">
            <button className="button secondary" type="button">Sync sources</button>
            <button className="button primary" type="button">Generate briefs</button>
          </div>
        </header>

        <section className="hero-band" aria-labelledby="pipeline-title">
          <div>
            <p className="eyebrow">Live opportunity engine</p>
            <h2 id="pipeline-title">18 content briefs moving from signal to publish.</h2>
            <p className="hero-copy">
              TrendPilot is prioritizing high-intent topics, drafting editorial briefs,
              matching writers, and flagging review gaps before scheduled publication.
            </p>
          </div>
          <div className="pipeline-visual" aria-label="Workflow status">
            <div>
              <span>Detected</span>
              <strong>42</strong>
            </div>
            <div>
              <span>Scored</span>
              <strong>31</strong>
            </div>
            <div>
              <span>Briefed</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Queued</span>
              <strong>5</strong>
            </div>
          </div>
        </section>

        <section className="metric-grid" aria-label="Brief pipeline metrics">
          {briefs.map((brief) => (
            <article className="metric-card" key={brief.label}>
              <span>{brief.label}</span>
              <strong>{brief.value}</strong>
              <p>{brief.change}</p>
            </article>
          ))}
        </section>

        <div className="dashboard-grid">
          <section className="trend-panel" id="trends" aria-labelledby="trends-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Trend queue</p>
                <h2 id="trends-title">Highest opportunity topics</h2>
              </div>
              <button className="icon-button" type="button" aria-label="Filter trend queue">F</button>
            </div>
            <div className="trend-table" role="table" aria-label="Trending topics">
              <div className="table-row table-head" role="row">
                <span role="columnheader">Topic</span>
                <span role="columnheader">Source</span>
                <span role="columnheader">Score</span>
                <span role="columnheader">Owner</span>
                <span role="columnheader">Status</span>
              </div>
              {trendQueue.map((trend) => (
                <div className="table-row" role="row" key={trend.topic}>
                  <strong role="cell">{trend.topic}</strong>
                  <span role="cell">{trend.source}</span>
                  <span role="cell" className="score">{trend.score}</span>
                  <span role="cell">{trend.owner}</span>
                  <span role="cell" className="status-pill">{trend.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="review-panel" id="review" aria-labelledby="review-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Draft review</p>
                <h2 id="review-title">AI quality signals</h2>
              </div>
            </div>
            <div className="review-list">
              {reviewSignals.map((signal) => (
                <div className="review-row" key={signal.label}>
                  <span>{signal.label}</span>
                  <strong className={signal.tone}>{signal.value}</strong>
                </div>
              ))}
            </div>
            <div className="review-note">
              <p className="eyebrow">Current blocker</p>
              <p>
                Add comparison section and refresh keyword cluster before scheduling.
              </p>
            </div>
          </section>
        </div>

        <section className="operations-band" id="writers" aria-label="Writer and publish operations">
          <div>
            <p className="eyebrow">Assignments</p>
            <h2>Writer load is balanced across 9 active briefs.</h2>
            <p>
              Three high-fit writers are available for the next AI search package,
              with average turnaround under 18 hours.
            </p>
          </div>
          <div className="assignment-list">
            <span><strong>3</strong> ready writers</span>
            <span><strong>6</strong> drafts due today</span>
            <span><strong>92%</strong> average compliance</span>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
