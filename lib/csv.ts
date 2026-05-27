export function transformToCSV(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return "";
  const columns = Object.keys(rows[0]);
  const header = columns.join(",");
  const lines = rows.map((row) =>
    columns
      .map((column) => {
        const value = row[column] ?? "";
        const normalized = String(value).replace(/"/g, '""');
        return `"${normalized.replace(/\n/g, " ")}"`;
      })
      .join(",")
  );
  return [header, ...lines].join("\n");
}
