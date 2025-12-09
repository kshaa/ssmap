--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE project (
  -- UUIDS primary key
  id UUID PRIMARY KEY,
  -- Creation/update timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post (
  -- String URL primary key
  url TEXT PRIMARY KEY,
  -- JSON for structured data extracted from the URL
  data JSON NOT NULL,
  -- Creation/update timestamps
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE post;
DROP TABLE project;
