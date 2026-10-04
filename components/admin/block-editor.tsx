"use client";
import { useState } from "react";
import { FONTS, type Block, type BlockStyle, type Theme } from "@/lib/cms/schema";
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
import { MediaDialog } from "./media";

const FONT_NAMES = Object.keys(FONTS) as (keyof typeof FONTS)[];

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
};
const BLOCK_TYPES = Object.keys(NEW_BLOCKS) as Block["type"][];

export function ThemeFields({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  return (
    <fieldset>
      <legend>Theme</legend>
      <ColorField
        label="Background color"
        value={theme.backgroundColor}
        onChange={(backgroundColor) => onChange({ ...theme, backgroundColor })}
      />
      <ImageField
        label="Background image"
        value={theme.backgroundImage}
        onChange={(backgroundImage) => onChange({ ...theme, backgroundImage })}
      />
      <SelectField
        label="Background position"
        value={theme.backgroundFocus}
        options={["center", "top", "bottom", "left", "right"]}
        onChange={(backgroundFocus) => onChange({ ...theme, backgroundFocus })}
      />
      <ColorField
        label="Text color"
        value={theme.textColor}
        onChange={(textColor) => onChange({ ...theme, textColor })}
      />
      <ColorField
        label="Accent color"
        value={theme.accentColor}
        onChange={(accentColor) => onChange({ ...theme, accentColor })}
      />
      <SelectField
        label="Font"
        value={theme.font}
        options={FONT_NAMES}
        onChange={(font) => onChange({ ...theme, font })}
      />
    </fieldset>
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
      <SelectField
        label="Width"
        value={style.width}
        options={["narrow", "full"]}
        onChange={(width) => onChange({ ...style, width })}
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

function SlideshowImages({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <>
      {images.map((image, i) => (
        <div className="row" key={i}>
          <ImageField
            label={`Image ${i + 1}`}
            value={image}
            onChange={(value) => onChange(replaceAt(images, i, value ?? ""))}
          />
          <RowControls items={images} index={i} onChange={onChange} />
        </div>
      ))}
      <button type="button" onClick={() => setPicking(true)}>
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
          <SelectField
            label="Font"
            value={block.font}
            options={FONT_NAMES}
            onChange={(font) => onChange({ ...block, font })}
          />
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
        <TextField
          label="Collection"
          value={block.collection}
          list="collections"
          onChange={(collection) => onChange({ ...block, collection })}
        />
      );
    case "html":
      return (
        <TextField label="HTML" rows={8} value={block.html} onChange={(html) => onChange({ ...block, html })} />
      );
  }
}

// The ordered list of a page's blocks, each with its fields, style overrides
// and move/remove buttons, plus the menu that adds a new block at the end.
export default function BlockEditor({
  blocks,
  onChange,
}: {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}) {
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
            <RowControls items={blocks} index={i} onChange={onChange} />
          </legend>
          <BlockFields block={block} onChange={(next) => onChange(replaceAt(blocks, i, next))} />
          <StyleFields
            style={block.style}
            onChange={(style) => onChange(replaceAt(blocks, i, { ...block, style }))}
          />
        </fieldset>
      ))}
      <Field label="Add a block">
        <select
          value=""
          onChange={(event) => {
            const type = BLOCK_TYPES.find((name) => name === event.target.value);
            if (type) add(type);
          }}
        >
          <option value="">Choose a type...</option>
          {BLOCK_TYPES.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </Field>
    </div>
  );
}
