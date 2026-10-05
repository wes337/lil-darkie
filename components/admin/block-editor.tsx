"use client";
import { useState } from "react";
import {
  type Block,
  type ContentBlock,
  type BlockStyle,
  type Show,
  type Slide,
  type Theme,
} from "@/lib/cms/schema";
import { slideParts, type resolveTheme } from "@/lib/cms/render";
import {
  ColorField,
  Field,
  ImageField,
  OptionalTextField,
  RowControls,
  SelectField,
  TextField,
  replaceAt,
} from "./fields";
import CollectionField from "./collection-field";
import { FontField } from "./font-field";
import Icon from "./icon";
import { MediaDialog } from "./media";

type ColorKey =
  | "backgroundColor"
  | "panelColor"
  | "textColor"
  | "headingColor"
  | "linkColor"
  | "linkHoverColor"
  | "buttonColor"
  | "buttonTextColor";

// What a freshly added block of each type starts as.
const NEW_BLOCKS: { [T in Block["type"]]: Omit<Extract<Block, { type: T }>, "id"> } = {
  heading: { type: "heading", text: "Heading", level: 2 },
  text: { type: "text", markdown: "" },
  image: { type: "image", src: "" },
  slideshow: { type: "slideshow", images: [] },
  embed: { type: "embed", url: "" },
  button: { type: "button", label: "Click here", href: "/" },
  spacer: { type: "spacer", size: "md" },
  posts: { type: "posts", collection: "writings" },
  html: { type: "html", html: "" },
  tour: { type: "tour", shows: [] },
  box: { type: "box", blocks: [] },
};
const BLOCK_TYPES = Object.keys(NEW_BLOCKS) as Block["type"][];

const isContent = (block: Block): block is ContentBlock => block.type !== "box";

// The theme form, in groups. `inherited` is what each setting falls back to
// when left empty, so the swatches show the color actually in use.
export function ThemeFields({
  theme,
  inherited,
  onChange,
}: {
  theme: Theme;
  inherited: ReturnType<typeof resolveTheme>;
  onChange: (theme: Theme) => void;
}) {
  const color = (label: string, key: ColorKey) => (
    <ColorField
      label={label}
      value={theme[key]}
      fallback={inherited[key]}
      onChange={(value) => onChange({ ...theme, [key]: value })}
    />
  );

  return (
    <>
      <fieldset>
        <legend>Background</legend>
        {color("Color", "backgroundColor")}
        <ImageField
          label="Image"
          value={theme.backgroundImage}
          onChange={(backgroundImage) => onChange({ ...theme, backgroundImage })}
        />
        <SelectField
          label="Image position"
          value={theme.backgroundFocus}
          options={["center", "top", "bottom", "left", "right"]}
          onChange={(backgroundFocus) => onChange({ ...theme, backgroundFocus })}
        />
        {color("Panel color", "panelColor")}
      </fieldset>
      <fieldset>
        <legend>Text</legend>
        {color("Text color", "textColor")}
        {color("Heading color", "headingColor")}
        <FontField value={theme.font} onChange={(font) => onChange({ ...theme, font })} />
      </fieldset>
      <fieldset>
        <legend>Links</legend>
        {color("Color", "linkColor")}
        {color("Hover color", "linkHoverColor")}
      </fieldset>
      <fieldset>
        <legend>Buttons</legend>
        {color("Color", "buttonColor")}
        {color("Text color", "buttonTextColor")}
      </fieldset>
    </>
  );
}

function StyleFields({
  style = {},
  onChange,
}: {
  style: BlockStyle | undefined;
  onChange: (style: BlockStyle) => void;
}) {
  return (
    <details>
      <summary>Style</summary>
      <SelectField
        label="Align"
        value={style.align}
        options={["left", "center", "right"]}
        onChange={(align) => onChange({ ...style, align })}
      />
      <ColorField
        label="Text color"
        value={style.textColor}
        onChange={(textColor) => onChange({ ...style, textColor })}
      />
      <ColorField
        label="Background color"
        value={style.backgroundColor}
        onChange={(backgroundColor) => onChange({ ...style, backgroundColor })}
      />
      <ImageField
        label="Background image"
        value={style.backgroundImage}
        onChange={(backgroundImage) => onChange({ ...style, backgroundImage })}
      />
    </details>
  );
}

// The images of a slideshow block, each with an optional caption. An image
// is saved as a bare URL until it has a caption.
function SlideshowImages({
  images,
  onChange,
}: {
  images: Slide[];
  onChange: (images: Slide[]) => void;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <>
      {images.map((image, i) => {
        const { src, caption } = slideParts(image);
        const set = (nextSrc: string, nextCaption: string | undefined) =>
          onChange(
            replaceAt(images, i, nextCaption ? { src: nextSrc, caption: nextCaption } : nextSrc),
          );
        return (
          <fieldset key={i}>
            <legend>
              Image {i + 1}
              <RowControls items={images} index={i} onChange={onChange} name={`image ${i + 1}`} />
            </legend>
            <ImageField label="Image" value={src} onChange={(value) => set(value ?? "", caption)} />
            <OptionalTextField label="Caption" value={caption} onChange={(value) => set(src, value)} />
          </fieldset>
        );
      })}
      <button type="button" onClick={() => setPicking(true)}>
        <Icon name="plus" />
        Add image
      </button>
      {picking && (
        <MediaDialog
          onClose={() => setPicking(false)}
          onPick={(url) => {
            onChange([...images, url]);
            setPicking(false);
          }}
        />
      )}
    </>
  );
}

// The shows of a tour block. Past ones stay listed here until removed; the
// site hides them by itself.
function Shows({ shows, onChange }: { shows: Show[]; onChange: (shows: Show[]) => void }) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {shows.map((show, i) => {
        const set = (changes: Partial<Show>) => onChange(replaceAt(shows, i, { ...show, ...changes }));
        return (
          <fieldset key={i}>
            <legend>
              {show.city || "Show"}
              <RowControls items={shows} index={i} onChange={onChange} name={show.city || "this show"} />
            </legend>
            <Field label="Date">
              <input type="date" value={show.date} onChange={(event) => set({ date: event.target.value })} />
            </Field>
            <TextField label="City" value={show.city} onChange={(city) => set({ city })} />
            <TextField label="Venue" value={show.venue} onChange={(venue) => set({ venue })} />
            <OptionalTextField label="Ticket link" value={show.ticketLink} onChange={(ticketLink) => set({ ticketLink })} />
            <OptionalTextField label="Opener" value={show.opener} onChange={(opener) => set({ opener })} />
            <label className="check">
              <input
                type="checkbox"
                checked={show.soldOut ?? false}
                onChange={(event) => set({ soldOut: event.target.checked })}
              />
              Sold out
            </label>
          </fieldset>
        );
      })}
      <button type="button" onClick={() => onChange([...shows, { date: today, city: "", venue: "" }])}>
        <Icon name="plus" />
        Add show
      </button>
    </>
  );
}

// The inputs specific to each block type.
function BlockFields({ block, onChange }: { block: Block; onChange: (block: Block) => void }) {
  switch (block.type) {
    case "heading":
      return (
        <>
          <TextField label="Text" value={block.text} onChange={(text) => onChange({ ...block, text })} />
          <Field label="Size">
            <select
              value={block.level}
              onChange={(event) =>
                onChange({ ...block, level: Number(event.target.value) as typeof block.level })
              }
            >
              <option value={1}>Large</option>
              <option value={2}>Medium</option>
              <option value={3}>Small</option>
            </select>
          </Field>
          <FontField value={block.font} onChange={(font) => onChange({ ...block, font })} />
        </>
      );
    case "text":
      return (
        <TextField
          label="Text"
          rows={8}
          value={block.markdown}
          onChange={(markdown) => onChange({ ...block, markdown })}
        />
      );
    case "image":
      return (
        <>
          <ImageField label="Image" value={block.src} onChange={(src) => onChange({ ...block, src: src ?? "" })} />
          <OptionalTextField label="Alt text" value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
          <OptionalTextField label="Caption" value={block.caption} onChange={(caption) => onChange({ ...block, caption })} />
          <OptionalTextField label="Link" value={block.href} onChange={(href) => onChange({ ...block, href })} />
        </>
      );
    case "slideshow":
      return <SlideshowImages images={block.images} onChange={(images) => onChange({ ...block, images })} />;
    case "embed":
      return (
        <TextField
          label="Link"
          value={block.url}
          onChange={(url) => onChange({ ...block, url })}
        />
      );
    case "button":
      return (
        <>
          <TextField label="Label" value={block.label} onChange={(label) => onChange({ ...block, label })} />
          <TextField label="Link" value={block.href} onChange={(href) => onChange({ ...block, href })} />
        </>
      );
    case "spacer":
      return (
        <Field label="Size">
          <select
            value={block.size}
            onChange={(event) => onChange({ ...block, size: event.target.value as typeof block.size })}
          >
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </Field>
      );
    case "posts":
      return (
        <CollectionField
          value={block.collection}
          onChange={(collection) => onChange({ ...block, collection })}
        />
      );
    case "html":
      return (
        <TextField label="HTML" rows={8} value={block.html} onChange={(html) => onChange({ ...block, html })} />
      );
    case "tour":
      return <Shows shows={block.shows} onChange={(shows) => onChange({ ...block, shows })} />;
    case "box":
      return (
        <BlockEditor
          nested
          blocks={block.blocks}
          onChange={(blocks) => onChange({ ...block, blocks: blocks.filter(isContent) })}
        />
      );
  }
}

// An ordered list of blocks, each with its fields, style overrides and
// move/remove buttons, plus the menu that adds a new block at the end. A box
// block holds a nested list of its own, which can't contain another box.
export default function BlockEditor({
  blocks,
  onChange,
  nested = false,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  nested?: boolean;
}) {
  const types = nested ? BLOCK_TYPES.filter((type) => type !== "box") : BLOCK_TYPES;

  function add(type: Block["type"]) {
    const id = crypto.randomUUID().slice(0, 8);
    onChange([...blocks, { ...NEW_BLOCKS[type], id } as Block]);
  }

  return (
    <div className="blocks">
      {blocks.map((block, i) => (
        <fieldset key={block.id}>
          <legend>
            {block.type}
            <RowControls items={blocks} index={i} onChange={onChange} name={`this ${block.type} block`} />
          </legend>
          <BlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, i, next))} />
          <StyleFields
            style={block.style}
            onChange={(style) => onChange(replaceAt(blocks, i, { ...block, style }))}
          />
        </fieldset>
      ))}
      <Field label={nested ? "Add to box" : "Add a block"}>
        <select
          value=""
          onChange={(event) => {
            const type = types.find((name) => name === event.target.value);
            if (type) add(type);
          }}
        >
          <option value="">Choose a type...</option>
          {types.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}
