import { pool } from '../db/pool.js';
export async function logError({ method, path, statusCode, message, stack, ip, userAgent, body, params, query }){
  await pool.query(
    `INSERT INTO error_logs(method,path,status_code,message,stack,ip,user_agent,body,params,query)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [method, path, statusCode, message, stack, ip, userAgent, body, params, query]
  );
}
