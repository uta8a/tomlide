import { parse } from "https://deno.land/std@0.126.0/encoding/toml.ts";

const decoder = new TextDecoder("utf-8");
const tomlObject = parse(
  decoder.decode(Deno.readFileSync("./example/slide.toml")),
);

type RawSlide = {
  title?: string;
  text?: string;
};
type RawSlideToml = {
  meta: {
    title: string;
    og_url?: string;
    og_title?: string;
    og_image?: string;
    og_image_width?: string;
    og_image_height?: string;
    og_image_description?: string;
    twitter_card?: string;
    twitter_creator?: string;
    twitter_image?: string;
    icon?: string;
  };
  slide: RawSlide[];
};

const rawToml = tomlObject as RawSlideToml;

import { configure, renderFile } from "https://deno.land/x/eta@v1.11.0/mod.ts";

const viewPath = `${Deno.cwd()}/src/views/`;

configure({
  // add plugin here
  // In the /views directory
  views: viewPath,
});

const templateResult = await renderFile("./template.eta", rawToml);

console.log(templateResult);

// there's no dist/, error
const write = Deno.writeTextFile(
  `${Deno.cwd()}/dist/index.html`,
  templateResult,
);

write.then(() => console.log("File written"));
