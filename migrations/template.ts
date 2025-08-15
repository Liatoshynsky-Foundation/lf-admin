import type { Connection } from 'mongoose';

export async function up(_connection: Connection): Promise<void> {
  // Write your migration here.
  // See https://github.com/seppevs/migrate-ts for examples.
}

export async function down(_connection: Connection): Promise<void> {
  // Write the statements to rollback your migration (if possible)
}
