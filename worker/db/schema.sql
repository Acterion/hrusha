CREATE TABLE IF NOT EXISTS candidates (
  id TEXT PRIMARY KEY,
  name TEXT,
  surname TEXT,
  cv TEXT,
  ha TEXT,
  status TEXT,
  decision TEXT,
  lastUpdated INTEGER,
  createdAt INTEGER
);