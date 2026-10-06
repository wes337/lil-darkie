"use client";
import { useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { MediaDialog } from "./media";

type Chain = ReturnType<Editor["chain"]>;

// One toolbar button. `mark` is the Tiptap name that lights it up while the
// cursor is inside that kind of text.
function Tool({
  editor,
  label,
  title,
  mark,
  run,
}: {
  editor: Editor;
  label: string;
  title: string;
  mark?: string | [string, Record<string, unknown>];
  run: (chain: Chain) => Chain;
}) {
  const active =
    mark !== undefined &&
    (typeof mark === "string" ? editor.isActive(mark) : editor.isActive(...mark));

  return (
    <button
      type="button"
      title={title}
      aria-pressed={active}
      // Keep the text selection while the button is pressed.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => run(editor.chain().focus()).run()}
    >
      {label}
    </button>
  );
}

// A classic rich text box: a toolbar over an editable area. It starts from
// `html` and reports the new HTML on every change. Images come from the
// media library.
export default function RichEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const [pickingImage, setPickingImage] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
    content: html,
    immediatelyRender: false,
    editorProps: { attributes: { class: "rich-content" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });
  if (!editor) return null;

  function setLink(chain: Chain) {
    const url = prompt("Link URL", editor?.getAttributes("link").href ?? "https://");
    if (url === null) return chain;
    return url === ""
      ? chain.extendMarkRange("link").unsetLink()
      : chain.extendMarkRange("link").setLink({ href: url });
  }

  return (
    <div>
      <div className="rich-toolbar">
        <Tool editor={editor} label="B" title="Bold" mark="bold" run={(c) => c.toggleBold()} />
        <Tool editor={editor} label="I" title="Italic" mark="italic" run={(c) => c.toggleItalic()} />
        <Tool editor={editor} label="U" title="Underline" mark="underline" run={(c) => c.toggleUnderline()} />
        <span className="gap" />
        <Tool editor={editor} label="H2" title="Heading" mark={["heading", { level: 2 }]} run={(c) => c.toggleHeading({ level: 2 })} />
        <Tool editor={editor} label="H3" title="Small heading" mark={["heading", { level: 3 }]} run={(c) => c.toggleHeading({ level: 3 })} />
        <span className="gap" />
        <Tool editor={editor} label="Quote" title="Quote" mark="blockquote" run={(c) => c.toggleBlockquote()} />
        <Tool editor={editor} label="List" title="Bullet list" mark="bulletList" run={(c) => c.toggleBulletList()} />
        <Tool editor={editor} label="1. List" title="Numbered list" mark="orderedList" run={(c) => c.toggleOrderedList()} />
        <span className="gap" />
        <Tool editor={editor} label="Link" title="Link" mark="link" run={setLink} />
        <button type="button" title="Image" onClick={() => setPickingImage(true)}>
          Image
        </button>
        <Tool editor={editor} label="Line" title="Horizontal line" run={(c) => c.setHorizontalRule()} />
        <span className="gap" />
        <Tool editor={editor} label="Undo" title="Undo" run={(c) => c.undo()} />
        <Tool editor={editor} label="Redo" title="Redo" run={(c) => c.redo()} />
      </div>
      <EditorContent editor={editor} />
      {pickingImage && (
        <MediaDialog
          onClose={() => setPickingImage(false)}
          onPick={(src) => {
            editor.chain().focus().setImage({ src }).run();
            setPickingImage(false);
          }}
        />
      )}
    </div>
  );
}
