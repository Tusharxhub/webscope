/**
 * Escapes a string/number for CSV format.
 * If the value contains commas, quotes, or newlines, it wraps the value in quotes
 * and escapes internal quotes by doubling them.
 */
function escapeCsvValue(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";

    const stringified = String(value);
    if (
        stringified.includes(",") ||
        stringified.includes('"') ||
        stringified.includes("\n") ||
        stringified.includes("\r")
    ) {
        return `"${stringified.replace(/"/g, '""')}"`;
    }
    return stringified;
}

/**
 * Converts an array of objects to a CSV string.
 *
 * @param data Array of items to convert
 * @param headers Array of header column names
 * @param rowMapper Function that maps an item to an array of CSV values (in the same order as headers)
 * @returns The generated CSV string
 */
export function toCSV<T>(
    data: T[],
    headers: string[],
    rowMapper: (item: T) => (string | number | null | undefined)[]
): string {
    const csvRows = [headers.join(",")];

    for (const item of data) {
        const rawValues = rowMapper(item);
        const escapedValues = rawValues.map(escapeCsvValue);
        csvRows.push(escapedValues.join(","));
    }

    return csvRows.join("\n");
}
