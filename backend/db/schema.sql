BEGIN;

-- BORRADO ORDENADO (solo si quieres reset)
DROP TABLE IF EXISTS user_item_memory CASCADE;
DROP TABLE IF EXISTS recommendation_sessions CASCADE;
DROP TABLE IF EXISTS analysis_history CASCADE;
DROP TABLE IF EXISTS linked_accounts CASCADE;
DROP TABLE IF EXISTS user_emotions CASCADE;
DROP TABLE IF EXISTS emotions CASCADE;
DROP TABLE IF EXISTS error_logs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- BASE
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,         -- añadido
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Catálogo de emociones
CREATE TABLE IF NOT EXISTS emotions (
  emotion_id SERIAL PRIMARY KEY,
  emotion VARCHAR(50) UNIQUE NOT NULL
);

-- instancias de emociones por usuario
CREATE TABLE IF NOT EXISTS user_emotions (
  user_emotion_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  emotion_id INTEGER REFERENCES emotions(emotion_id) ON DELETE CASCADE NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auditoría
CREATE TABLE IF NOT EXISTS error_logs (
  error_log_id BIGSERIAL PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  method VARCHAR(10),
  path TEXT,
  status_code INT,
  message TEXT,
  stack TEXT,
  ip INET,
  user_agent TEXT,
  body JSONB,
  params JSONB,
  query JSONB
);

-- Cuentas vinculadas (Spotify)
CREATE TABLE IF NOT EXISTS linked_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  provider VARCHAR(30) NOT NULL,            -- 'spotify'
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  scope TEXT,
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, provider),
  UNIQUE(provider, provider_user_id)
);

-- Historial de análisis (tu tabla actual)
CREATE TABLE IF NOT EXISTS analysis_history (
  analysis_id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  emotion_id INTEGER REFERENCES emotions(emotion_id) ON DELETE RESTRICT NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  playlist_id VARCHAR(50) NOT NULL,
  playlist_url TEXT NOT NULL,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historial de recomendaciones por emoción (nueva)
CREATE TABLE IF NOT EXISTS recommendation_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,  -- NULL si invitado
  emotion VARCHAR(50) NOT NULL,
  confidence DECIMAL(5,4) CHECK (confidence BETWEEN 0 AND 1),
  tracks TEXT[],
  playlists TEXT[],
  seed JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Memoria por usuario/emoción para evitar repeticiones (nuevo)
CREATE TABLE IF NOT EXISTS user_item_memory (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  emotion VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('track','playlist')),
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_item_memory
  ON user_item_memory(user_id, emotion, item_type, created_at DESC);

-- Precarga de emociones estándar (como tenías)
INSERT INTO emotions (emotion) VALUES 
('HAPPY'),('SAD'),('ANGRY'),('FEAR'),('SURPRISE'),('CALM'),('CONFUSED'),('DISGUST')
ON CONFLICT (emotion) DO NOTHING;

COMMIT;