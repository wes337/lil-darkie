import Link from "next/link";
import { marked } from "marked";
import CopyButton from "@/components/admin/copy-button";
import { GUIDE, JSON_SCHEMAS } from "@/lib/cms/guide";

// The same guide /api/schema serves, with a button that copies it and the
// JSON schemas together for pasting into an AI assistant.
export default function HelpPage() {
  const schemas = JSON.stringify(JSON_SCHEMAS, null, 2);

  return (
    <main className="dashboard help">
      <header className="row">
        <Link href="/admin">← All content</Link>
        <h1>Help</h1>
        <span className="spacer" />
        <CopyButton
          label="Copy this guide for Claude"
          text={`${GUIDE}\n## JSON schemas\n\n${schemas}\n`}
        />
      </header>
      <p>
        To have an AI assistant edit a page: copy this guide into the chat, then
        copy the page from its JSON tab, say what you want changed, and paste
        the result back into the JSON tab.
      </p>
      <div dangerouslySetInnerHTML={{ __html: marked.parse(GUIDE, { async: false }) }} />
      <details>
        <summary>JSON schemas</summary>
        <pre>{schemas}</pre>
      </details>
    </main>
  );
}
