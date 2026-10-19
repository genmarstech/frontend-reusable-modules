/**
 * `Product.description` is one free-text field on the backend — there's no
 * Material/Fit/Care columns to add without a migration in a different repo
 * (catalog/models.py), and most businesses on this platform aren't selling
 * apparel at all, so three dedicated fields on every product would be dead
 * weight for them. This gives a fashion business the guided fields it
 * actually wants while storing exactly what it typed, as real text, in the
 * one field that already exists — composeDescription writes each filled-in
 * field as its own labeled, emoji-prefixed line; parseDescription reads
 * them back out the same way so re-opening "Edit details" shows the same
 * four boxes instead of one undifferentiated block of text.
 *
 * The round trip degrades gracefully, not silently: a description written
 * before this existed, or edited by hand outside these exact prefixes,
 * just lands entirely in `notes` — nothing is dropped, nothing is
 * mis-parsed into the wrong box, and saving it straight back out
 * (composeDescription(parseDescription(text)) with empty material/fit/care)
 * reproduces the original text unchanged.
 */
const FIELD_PREFIXES = {
  material: "🧵 Material:",
  fit: "📏 Fit:",
  care: "🧺 Care:",
} as const;

type StructuredField = keyof typeof FIELD_PREFIXES;

export interface DescriptionFields {
  material: string;
  fit: string;
  care: string;
  notes: string;
}

export function composeDescription(fields: DescriptionFields): string {
  const structuredLines = (Object.keys(FIELD_PREFIXES) as StructuredField[])
    .map((key) => (fields[key].trim() ? `${FIELD_PREFIXES[key]} ${fields[key].trim()}` : null))
    .filter((line): line is string => line !== null);

  const structured = structuredLines.join("\n");
  const notes = fields.notes.trim();
  if (structured && notes) return `${structured}\n\n${notes}`;
  return structured || notes;
}

export function parseDescription(description: string): DescriptionFields {
  const fields: DescriptionFields = { material: "", fit: "", care: "", notes: "" };
  const remainder: string[] = [];

  for (const line of description.split("\n")) {
    const key = (Object.keys(FIELD_PREFIXES) as StructuredField[]).find((candidate) =>
      line.startsWith(FIELD_PREFIXES[candidate])
    );
    if (key) {
      fields[key] = line.slice(FIELD_PREFIXES[key].length).trim();
    } else {
      remainder.push(line);
    }
  }

  fields.notes = remainder.join("\n").trim();
  return fields;
}
