/**
 * Database schema constant for raw SQL / Kysely queries.
 *
 * Prisma ORM queries are schema-aware via search_path, but raw queries
 * must explicitly qualify table names: "documenso"."TableName".
 */
export const DB_SCHEMA = 'documenso';

/**
 * Returns a schema-qualified, double-quoted table reference for raw SQL.
 *
 * @example t('User')       // → "documenso"."User"
 * @example t('Envelope')   // → "documenso"."Envelope"
 */
export function t(table: string): string {
  return `"${DB_SCHEMA}"."${table}"`;
}
