-- ...existing code...
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS emotions;
DROP TABLE IF EXISTS user_emotions CASCADE;
DROP TABLE IF EXISTS error_logs;
DROP TABLE IF EXISTS linked_accounts CASCADE;
DROP TABLE IF EXISTS analysis_history CASCADE;

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,  -- Para bcrypt o argon2
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- Catálogo de emociones
CREATE TABLE IF NOT EXISTS emotions (
  emotion_id SERIAL PRIMARY KEY,
  emotion VARCHAR(50) UNIQUE NOT NULL  -- evita duplicados
);

-- 3. instancias de emociones por usuario
CREATE TABLE IF NOT EXISTS user_emotions (
  user_emotion_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
  emotion_id INTEGER REFERENCES emotions(emotion_id) ON DELETE CASCADE NOT NULL,
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Auditoria y debugging
CREATE TABLE IF NOT EXISTS error_logs (
    error_log_id BIGSERIAL PRIMARY KEY,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Momento del error
    method VARCHAR(10), -- GET/POST/PUT/DELETE
    path TEXT, -- Ruta de la petición
    status_code INT, -- Código de respuesta (p.ej., 400/404/500)
    message TEXT, -- Mensaje de error
    stack TEXT, -- Stack trace (oculto en prod)
    ip INET, -- IP del cliente
    user_agent TEXT, -- Navegador/cliente
    body JSONB, -- Cuerpo de la solicitud
    params JSONB, -- Parámetros de ruta
    query JSONB -- Querystring
);

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

-- Historial final de análisis (Rekognition + Spotify)
CREATE TABLE IF NOT EXISTS analysis_history (
    analysis_id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    -- Resultado del Análisis de Emoción
    emotion_id INTEGER REFERENCES emotions(emotion_id) ON DELETE RESTRICT NOT NULL,
    confidence DECIMAL(5,4) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    -- Resultado de la integración con Spotify
    playlist_id VARCHAR(50) NOT NULL,
    playlist_url TEXT NOT NULL,
    -- Metadatos
    analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Precarga de las emociones estándar detectadas por AWS Rekognition
INSERT INTO emotions (emotion) VALUES 
('HAPPY'), 
('SAD'), 
('ANGRY'), 
('FEAR'),
('SURPRISE'), 
('CALM'), 
('CONFUSED'), 
('DISGUST');