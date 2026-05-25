CREATE TABLE IF NOT EXISTS creations (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  content TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  publish BOOLEAN DEFAULT false,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creations_user_id ON creations(user_id);
CREATE INDEX IF NOT EXISTS idx_creations_publish ON creations(publish);
