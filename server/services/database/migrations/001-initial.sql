--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE project (
  -- UUIDS primary key
  id UUID PRIMARY KEY,
  -- Name of the project
  name TEXT NOT NULL,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER))
);

CREATE TABLE post (
  -- String URL primary key
  url TEXT PRIMARY KEY,
  -- JSON for structured data extracted from the URL
  data JSON NOT NULL,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER))
);

CREATE TABLE feed_post (
  -- String URL of the feed
  feed_url TEXT NOT NULL,
  -- String URL of the post
  post_url TEXT NOT NULL,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  PRIMARY KEY (feed_url, post_url)
);

CREATE TABLE feed (
  -- String URL primary key
  url TEXT PRIMARY KEY,
  -- JSON for structured data extracted from the URL
  data JSON NOT NULL,
  -- Whether the feed is a listing page
  is_listing_page BOOLEAN NOT NULL DEFAULT FALSE,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER))
);

CREATE TABLE project_post (
  -- UUID of the project
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  -- String URL of the post
  post_url TEXT NOT NULL REFERENCES post(url) ON DELETE CASCADE,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  PRIMARY KEY (project_id, post_url)
);

CREATE TABLE project_feed (
  -- UUID of the project
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  -- String URL of the post
  feed_url TEXT NOT NULL REFERENCES feed(url) ON DELETE CASCADE,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  PRIMARY KEY (project_id, feed_url)
);

CREATE TABLE project_post_feeling (
  -- UUID of the project
  project_id UUID NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  -- String URL of the post
  post_url TEXT NOT NULL REFERENCES post(url) ON DELETE CASCADE,
  -- Whether the post has been seen by the user
  is_seen BOOLEAN NOT NULL DEFAULT FALSE,
  -- Number of stars the user has given to the post
  stars INTEGER NOT NULL DEFAULT 0,
  -- Creation/update timestamps (Unix timestamps in milliseconds)
  created_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  updated_at INTEGER NOT NULL DEFAULT (CAST(unixepoch('subsec') * 1000 AS INTEGER)),
  PRIMARY KEY (project_id, post_url)
);

--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE project_post_feeling;
DROP TABLE project_feed;
DROP TABLE project_post;
DROP TABLE feed_post;
DROP TABLE post;
DROP TABLE project;
