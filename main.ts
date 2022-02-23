import { parse as parseToml } from "https://deno.land/std@0.126.0/encoding/toml.ts";
import {
  getConfig,
  render,
  renderFile,
} from "https://deno.land/x/eta@v1.11.0/mod.ts";

import { plugin } from "./src/plugins/postprocess.ts";

const decoder = new TextDecoder("utf-8");
const tomlObject = parseToml(
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

const viewPath = `${Deno.cwd()}/views/`;

const config = getConfig({
  views: viewPath,
  replaceData: rawToml,
});

const templateResult = await renderFile("./template.eta", rawToml, config);
const postConfig = getConfig({
  plugins: [plugin],
  views: viewPath,
  replaceData: rawToml,
});
// console.log(templateResult);
// // console.log(pluginLink);

// configure({
//   // add plugin here
//   plugins: [pluginLink],
// });

const renderTwice = await render(templateResult, {}, postConfig);

console.log("twice: ", renderTwice);

// there's no dist/, error
const write = Deno.writeTextFile(
  `${Deno.cwd()}/dist/index.html`,
  renderTwice as string,
);

write.then(() => console.log("File written"));
