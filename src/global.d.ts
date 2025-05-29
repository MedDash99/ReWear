// global.d.ts
import { type Database as BetterSqlite3Database } from 'better-sqlite3';

declare global {
  var _db: BetterSqlite3Database | undefined;
}