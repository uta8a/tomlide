import { assertEquals, assertThrows } from "../deps.ts";

import {
  emFunction,
  emojiFunction,
  imageFunction,
  linkFunction,
  replaceElement,
} from "../src/plugins/postprocess.ts";

// Compact form: name and function
Deno.test("replaceElement #1", () => {
  assertEquals(
    replaceElement("AABaBBAA", /A/, (_e: string) => {
      return "C";
    }),
    "CCBaBBCC",
  );
});

Deno.test("replaceElement #2", () => {
  assertEquals(
    replaceElement("AABaBBAA", /D/, (_e: string) => {
      return "C";
    }),
    "AABaBBAA",
  );
});

Deno.test("replaceElement #3", () => {
  assertEquals(
    replaceElement("aabbbbbbb", /a/, (_e: string) => {
      return "C";
    }),
    "CCbbbbbbb",
  );
});

Deno.test("replace link #1", () => {
  assertThrows(
    () => {
      linkFunction("None");
    },
    Error,
    "Empty link match",
  );
});

Deno.test("replace link #2", () => {
  assertThrows(
    () => {
      // space is not allowed
      linkFunction("@[link ](URL)");
    },
    Error,
    "Valid Form: @[link](URL) or @[link: `title`](URL)",
  );
});

Deno.test("replace link #3", () => {
  assertEquals(
    linkFunction("@[link](https://example.com/)"),
    `<a href="https://example.com/" target="_blank" rel="noopener">https://example.com/</a>`,
  );
});

Deno.test("replace link #4", () => {
  assertEquals(
    linkFunction("@[link: Example](https://example.com/)"),
    `<a href="https://example.com/" target="_blank" rel="noopener">Example</a>`,
  );
});

Deno.test("replace link #5", () => {
  assertEquals(
    linkFunction("@[link](@2)"),
    `<a href="/#2" target="_blank" rel="noopener">/#2</a>`,
  );
});

Deno.test("replace image #1", () => {
  assertThrows(
    () => {
      // space is not allowed
      imageFunction("@[image : ](URL)");
    },
    Error,
    "Valid Form: @[image](URL) or @[image: `title`](URL)",
  );
});

Deno.test("replace image #2", () => {
  assertEquals(
    imageFunction("@[image](https://example.com/example.png)"),
    `<img src="https://example.com/example.png" class="sld-left"/>`,
  );
});

Deno.test("replace image #3", () => {
  assertEquals(
    imageFunction("@[image: Example](https://example.com/example.png)"),
    `<figure><img src="https://example.com/example.png" class="sld-left" alt="Example"/><figcaption>Example</figcaption></figure>`,
  );
});

Deno.test("replace image #4", () => {
  assertEquals(
    imageFunction("@[image](./example.png)"),
    `<img src="./example.png" class="sld-left"/>`,
  );
});

Deno.test("replace emoji #1", () => {
  assertEquals(
    emojiFunction({} as Record<string, Array<string>>)("@[:sob:]"),
    `<img src="./1f62d.svg" class="sld-emoji-text"/>`,
  );
});

Deno.test("replace emphasize #1", () => {
  assertEquals(
    emFunction("@[*HELLO WORLD*]"),
    `<span class="sld-em">HELLO WORLD</span>`,
  );
});
