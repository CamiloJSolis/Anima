// backend/src/middleware/isAuthenticatedRedirect.js

import jwt from 'jsonwebtoken';

export function isAuthenticatedRedirect(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return next();
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        
        // Si el token es válido, redirigir a la página de playlists/historial
        return res.status(302).set('Location', '/historial').json({ 
            message: 'Ya has iniciado sesión. Redirigiendo...' 
        });

    } catch (e) {
        // Token inválido, ignorar y dejar que el flujo continúe hacia el login/register
        next();
    }
}