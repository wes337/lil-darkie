"use client";
import { Issues } from "@/components/admin/editor";
import { Field } from "@/components/admin/fields";
import LandingButtons from "@/components/admin/landing-buttons";
import LinkList from "@/components/admin/navigation";
import { useFetched, useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, siteSchema, type Page, type Site } from "@/lib/cms/schema";

export default function LandingView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const pages = useFetched<Page[]>("/api/pages") ?? [];
  const site = record.doc;
  if (!site) return <p>Loading...</p>;

  const layout = site.landingLayout ?? "simple";

  return (
    <main className="view">
      <header className="row">
        <h1>Landing</h1>
        <span className="spacer" />
        {record.state.saved && <span className="saved">Saved</span>}
        <a className="button" href="/" target="_blank" rel="noreferrer">View</a>
      </header>
      <Issues issues={record.state.issues} />
      <fieldset disabled={record.state.saving}>
        <legend>Layout</legend>
        <Field label="Landing page">
          <select
            value={layout}
            onChange={(event) => {
              const landingLayout = event.target.value;
              if (landingLayout === "simple" || landingLayout === "painting") {
                void record.save({ ...site, landingLayout });
              }
            }}
          >
            <option value="simple">Simple button list</option>
            <option value="painting">Original painting</option>
          </select>
        </Field>
        <p>The original painting, animations and styles are preserved. Switch layouts here at any time.</p>
        <p>Changes save immediately. Each layout keeps its own buttons.</p>
      </fieldset>
      {layout === "simple" ? (
        <LandingButtons record={record} pages={pages} />
      ) : (
        <fieldset disabled={record.state.saving}>
          <legend>Buttons below Play the Game</legend>
          <LinkList record={record} field="homeButtons" pages={pages} />
        </fieldset>
      )}
    </main>
  );
}
