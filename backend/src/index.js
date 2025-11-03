import dotenv from 'dotenv';
dotenv.config(); // <-- antes de cualquier uso de process.env

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes.js';
import analyzeRoutes from './routes/analyze.routes.js';
import spotifyRoutes from './routes/spotify.routes.js';
import recRoutes from './routes/recommendations.routes.js';


const app = express();
app.use(helmet());
app.use(cors({
  origin: 'http://127.0.0.1:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));


app.get('/health', (req,res)=>res.json({ ok:true }));

app.use('/auth', authRoutes);
app.use('/api', analyzeRoutes); 
app.use('/auth/spotify', spotifyRoutes);
app.use('/recommendations', recRoutes);

// logger de errores para ver el 500
app.use((err, req, res, next) => {
  console.error('❌ Internal:', err.message, '\n', err.stack);
  res.status(err.status || 500).json({ error: 'Internal error', details: err.message });
});

app.listen(process.env.PORT || 4000, () => console.log('API up'));
