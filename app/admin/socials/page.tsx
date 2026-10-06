"use client";
import { Issues, SaveStatus } from "@/components/admin/editor";
import { useRecord } from "@/components/admin/use-record";
import { DEFAULT_SITE, SOCIAL_PLATFORMS, siteSchema, type Site } from "@/lib/cms/schema";
import Icon from "@/components/admin/icon";

// One URL box per social platform. A platform with no URL isn't shown on the
// site, so the saved list only holds the filled-in ones.
export default function SocialsView() {
  const record = useRecord<Site>("/api/site", siteSchema, () => DEFAULT_SITE);
  const site = record.doc;
  if (!site) return null;

  const urlOf = (platform: string) =>
    site.social.find((social) => social.platform === platform)?.href ?? "";

  function setUrl(platform: (typeof SOCIAL_PLATFORMS)[number], href: string) {
    if (!site) return;
    const social = SOCIAL_PLATFORMS.map((name) => ({
      platform: name,
      href: name === platform ? href : urlOf(name),
    })).filter((entry) => entry.href !== "");
    record.setDoc({ ...site, social });
  }

  return (
    <main className="view">
      <header className="row">
        <h1>
          <Icon name="users_3" size={32} />
          Socials
        </h1>
      </header>
      {SOCIAL_PLATFORMS.map((platform) => (
        <label className="field inline" key={platform}>
          <span>{platform}</span>
          <input
            type="text"
            value={urlOf(platform)}
            onChange={(event) => setUrl(platform, event.target.value)}
          />
        </label>
      ))}
      <Issues issues={record.state.issues} />
      <div className="row">
        <button
          type="button"
          className="primary"
          disabled={record.state.saving}
          onClick={() => record.save()}
        >
          <Icon name="diskette" />
          Save
        </button>
        <SaveStatus dirty={record.dirty} saving={record.state.saving} saved={record.state.saved} />
      </div>
    </main>
  );
}
