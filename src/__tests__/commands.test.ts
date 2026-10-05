/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Schema } from "prosemirror-model";
import { EditorState } from "prosemirror-state";
import { builders, eq } from "prosemirror-test-builder";
import { assert, describe, it } from "vitest";

import {
  applySuggestion,
  applySuggestions,
  revertSuggestion,
  revertSuggestions,
} from "../commands.js";
import { addSuggestionMarks } from "../schema.js";
import { testBuilders } from "../testing/testBuilders.js";

describe("applyTrackedChanges", () => {
  it("should apply all tracked changes in the doc", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph(
        "fir",
        testBuilders.deletion({ id: 1 }, "st"),
        testBuilders.insertion({ id: 1 }, "e"),
        " paragraph",
      ),
      testBuilders.modification(
        {
          id: 3,
          type: "attr",
          attrName: "src",
          previousValue: "https://dskrpt.de/test-image",
          newValue: "https://dskrpt.de/test-image-2",
        },
        testBuilders.image({ src: "https://dskrpt.de/test-image-2" }),
      ),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
      testBuilders.modification(
        {
          id: 4,
          type: "nodeType",
          previousValue: "paragraph",
          newValue: "heading",
        },
        testBuilders.modification(
          {
            id: 4,
            type: "attr",
            attrName: "level",
            previousValue: 1,
            newValue: 2,
          },
          testBuilders.heading({ level: 2 }, "third paragraph"),
        ),
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("fire paragraph"),
      testBuilders.image({ src: "https://dskrpt.de/test-image-2" }),
      testBuilders.paragraph("secundo paragraph"),
      testBuilders.heading({ level: 2 }, "third paragraph"),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });

  it("should treat deletions across boundaries as a single deletion", async () => {
    const doc = testBuilders.doc(
      testBuilders.blockBoundarySuggestion(
        { id: 1, type: "deletion" },
        testBuilders.paragraph(
          "first ",
          testBuilders.deletion({ id: 1 }, "paragraph"),
        ),
      ),
      testBuilders.paragraph(
        testBuilders.deletion({ id: 1 }, "second "),
        "paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("first paragraph"),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
  it("should removed doubles spaces around deletions", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph(
        "first ",
        testBuilders.deletion({ id: "1" }, "second"),
        " third",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(testBuilders.paragraph("first third"));

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
  it("should removed doubles spaces around deletions across boundaries", async () => {
    const doc = testBuilders.doc(
      testBuilders.blockBoundarySuggestion(
        { id: 1, type: "deletion" },
        testBuilders.paragraph(
          "first ",
          testBuilders.deletion({ id: "1" }, "paragraph"),
        ),
      ),
      testBuilders.paragraph(
        testBuilders.deletion({ id: "1" }, "second"),
        " paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("first paragraph"),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
  it("should apply a block deletion at the end of the doc without throwing", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph("first"),
      testBuilders.deletion({ id: 1 }, testBuilders.paragraph("second")),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(testBuilders.paragraph("first"));

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
});

describe("applyTrackedChange", () => {
  it("should apply specified tracked change", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph(
        "fir",
        testBuilders.deletion({ id: 1 }, "st"),
        testBuilders.insertion({ id: 1 }, "e"),
        " paragraph",
      ),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestion(1)(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("fire paragraph"),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });

  it("should match suggestion marks even when they include extra attrs", async () => {
    const schemaWithAuthors = new Schema({
      nodes: {
        doc: { content: "block+" },
        paragraph: { content: "inline*", group: "block" },
        text: { group: "inline" },
      },
      marks: addSuggestionMarks(
        {},
        {
          author: {
            spec: { default: null },
            toDOM: (authorId: string) => ({
              "data-author-id": authorId,
            }),
            parseDOM: (node) => node.dataset["authorId"],
          },
        },
      ),
    });
    const customBuilders = builders(schemaWithAuthors);

    const doc = customBuilders.doc(
      customBuilders.paragraph(
        "fir",
        customBuilders.deletion({ id: 1, author: "alice" }, "st"),
        customBuilders.insertion({ id: 1, author: "alice" }, "e"),
        " paragraph",
      ),
      customBuilders.paragraph(
        "sec",
        customBuilders.deletion({ id: 2, author: "bob" }, "ond"),
        customBuilders.insertion({ id: 2, author: "bob" }, "undo"),
        " paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestion(1)(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = customBuilders.doc(
      customBuilders.paragraph("fire paragraph"),
      customBuilders.paragraph(
        "sec",
        customBuilders.deletion({ id: 2, author: "bob" }, "ond"),
        customBuilders.insertion({ id: 2, author: "bob" }, "undo"),
        " paragraph",
      ),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
});

describe("revertTrackedChanges", () => {
  it("should revert all tracked changes in the doc", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph(
        "fir",
        testBuilders.deletion({ id: 1 }, "st"),
        testBuilders.insertion({ id: 1 }, "e"),
        " paragraph",
      ),
      testBuilders.modification(
        {
          id: 3,
          type: "attr",
          attrName: "src",
          previousValue: "https://dskrpt.de/test-image",
          newValue: "https://dskrpt.de/test-image-2",
        },
        testBuilders.image({ src: "https://dskrpt.de/test-image-2" }),
      ),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
      testBuilders.modification(
        {
          id: 4,
          type: "nodeType",
          previousValue: "paragraph",
          newValue: "heading",
        },
        testBuilders.modification(
          {
            id: 4,
            type: "attr",
            attrName: "level",
            previousValue: 1,
            newValue: 2,
          },
          testBuilders.heading({ level: 2 }, "third paragraph"),
        ),
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      revertSuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("first paragraph"),
      testBuilders.image({ src: "https://dskrpt.de/test-image" }),
      testBuilders.paragraph("second paragraph"),
      testBuilders.paragraph("third paragraph"),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });

  it("should treat insertions across boundaries as a single insertion", async () => {
    const doc = testBuilders.doc(
      testBuilders.blockBoundarySuggestion(
        { id: 1, type: "insertion" },
        testBuilders.paragraph(
          "first ",
          testBuilders.insertion({ id: 1 }, "paragraph"),
        ),
      ),
      testBuilders.paragraph(
        testBuilders.insertion({ id: 1 }, "second "),
        "paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      revertSuggestions(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("first paragraph"),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
});

describe("revertTrackedChange", () => {
  it("should revert specified tracked change", async () => {
    const doc = testBuilders.doc(
      testBuilders.paragraph(
        "fir",
        testBuilders.deletion({ id: 1 }, "st"),
        testBuilders.insertion({ id: 1 }, "e"),
        " paragraph",
      ),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
    );

    const editorState = EditorState.create({
      doc,
    });

    const newState = await new Promise<EditorState>((resolve) => {
      revertSuggestion(1)(editorState, (tr) => {
        resolve(editorState.apply(tr));
      });
    });

    const expected = testBuilders.doc(
      testBuilders.paragraph("first paragraph"),
      testBuilders.paragraph(
        "sec",
        testBuilders.deletion({ id: 2 }, "ond"),
        testBuilders.insertion({ id: 2 }, "undo"),
        " paragraph",
      ),
    );

    assert(
      eq(newState.doc, expected),
      `Expected ${newState.doc} to match ${expected}`,
    );
  });
});

/**
 * Deciding one suggestion must touch one suggestion, and must work when the only thing suggested
 * was a change of formatting.
 *
 * Both of these bit a real editor. A reader who may only suggest, taking back their own edit, had
 * every other suggestion's modification marks stripped out of the body along with their own —
 * which the server refused as somebody else's to withdraw, and the editor went read-only for the
 * rest of the session. And a suggestion that only changed a heading's level could not be taken
 * back or rejected at all: the command looked for steps before it had made any.
 */
describe("deciding one suggestion among several", () => {
  const twoModifications = () =>
    testBuilders.doc(
      testBuilders.modification(
        { id: 1, type: "attr", attrName: "level", previousValue: 1, newValue: 2 },
        testBuilders.heading({ level: 2 }, "mine"),
      ),
      testBuilders.modification(
        { id: 2, type: "attr", attrName: "level", previousValue: 1, newValue: 3 },
        testBuilders.heading({ level: 3 }, "theirs"),
      ),
    );

  it("reverts a modification-only suggestion at all", async () => {
    const editorState = EditorState.create({ doc: twoModifications() });

    const dispatched = await new Promise<boolean>((resolve) => {
      const ran = revertSuggestion(1)(editorState, () => resolve(true));
      if (!ran) resolve(false);
    });

    assert(dispatched, "revertSuggestion made no steps for a suggestion that is only a modification");
  });

  it("leaves the other suggestion's marks where they were", async () => {
    const editorState = EditorState.create({ doc: twoModifications() });

    const newState = await new Promise<EditorState>((resolve) => {
      revertSuggestion(1)(editorState, (tr) => resolve(editorState.apply(tr)));
    });

    const expected = testBuilders.doc(
      testBuilders.heading({ level: 1 }, "mine"),
      testBuilders.modification(
        { id: 2, type: "attr", attrName: "level", previousValue: 1, newValue: 3 },
        testBuilders.heading({ level: 3 }, "theirs"),
      ),
    );

    assert(eq(newState.doc, expected), `Expected ${newState.doc} to match ${expected}`);
  });

  it("applies one without flattening the other", async () => {
    const editorState = EditorState.create({ doc: twoModifications() });

    const newState = await new Promise<EditorState>((resolve) => {
      applySuggestion(1)(editorState, (tr) => resolve(editorState.apply(tr)));
    });

    const expected = testBuilders.doc(
      testBuilders.heading({ level: 2 }, "mine"),
      testBuilders.modification(
        { id: 2, type: "attr", attrName: "level", previousValue: 1, newValue: 3 },
        testBuilders.heading({ level: 3 }, "theirs"),
      ),
    );

    assert(eq(newState.doc, expected), `Expected ${newState.doc} to match ${expected}`);
  });
});
