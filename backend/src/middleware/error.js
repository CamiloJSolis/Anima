import { logError } from '../services/error-log.service.js';
export function errorHandler(err, req, res, next){
  const status = err.status || 500;
  logError({
    method: req.method, path: req.originalUrl, statusCode: status,
    message: err.message, stack: err.stack, ip: req.ip, userAgent: req.get('user-agent'),
    body: req.body, params: req.params, query: req.query
  }).catch(()=>{});
  res.status(status).json({ error: status === 500 ? 'Internal error' : err.message });
}
