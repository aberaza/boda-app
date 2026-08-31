import { getDatabase, type DatabaseConnection } from '@netlify/database';

let connection: DatabaseConnection | undefined;

export function getRsvpDatabase(): DatabaseConnection {
  connection ??= getDatabase();
  return connection;
}
