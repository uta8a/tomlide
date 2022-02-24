import {
  basename,
  compile,
  download,
  ensureDirSync,
  extname,
  getConfig,
  parseToml,
  plugin,
  render,
  walk,
} from "./deps.ts";

// mkdir -p dist/
await ensureDirSync("dist");

const decoder = new TextDecoder("utf-8");
const tomlObject = parseToml(
  // get current dir's slide.toml
  decoder.decode(Deno.readFileSync("./slide.toml")),
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

const viewPath = "https://raw.githubusercontent.com/uta8a/tomlide/main/views/";

let rawTemplate = await (await fetch(`${viewPath}/template.eta`)).text();
const rawBody = await (await fetch(`${viewPath}/body.eta`)).text();
const rawJs = await (await fetch(`${viewPath}/main.js`)).text();
const rawCss = await (await fetch(`${viewPath}/style.css`)).text();

rawTemplate = rawTemplate.replace(
  `<%~ includeFile('./style.css') %>`,
  `<%~ include('style.css') %>`,
);
rawTemplate = rawTemplate.replace(
  `<%~ includeFile('./body.eta', {slide: it.slide, title: it.meta.title}) %>`,
  `<%~ include('body.eta', {slide: it.slide, title: it.meta.title}) %>`,
);
rawTemplate = rawTemplate.replace(
  `<%~ includeFile('./main.js') %>`,
  `<%~ include('main.js') %>`,
);

const config = getConfig({
  replaceData: rawToml,
});

config.templates.define("body.eta", compile(rawBody));
config.templates.define("main.js", compile(rawJs));
config.templates.define("style.css", compile(rawCss));

const templateResult = await render(rawTemplate, rawToml, config);
const postConfig = getConfig({
  plugins: [plugin],
  replaceData: rawToml,
  emojis: [],
});

const renderTwice = await render(templateResult as string, {}, postConfig);

// console.log("DEBUG: ", renderTwice);

// there's no dist/, error
const write = Deno.writeTextFile(
  `./dist/index.html`,
  renderTwice as string,
);

write.then(() => console.log("File written to dist/"));

// copy assets
const files = walk(".");
for await (const file of files) {
  if (
    file.isFile && !file.path.startsWith("dist/") &&
    /[png|jpg|ico|svg|PNG|JPG|ICO|SVG]$/.test(extname(file.path))
  ) {
    const dest = file.path;
    console.log(dest);
    await Deno.copyFileSync(file.path, `dist/${dest}`);
    console.log(`Copy to dist/: ${file.path}`);
  }
}
// https://raw.githubusercontent.com/uta8a/tomlide/main/assets/twemoji/1f004.svg
const getEmoji = async (code: string) => {
  const filePath =
    `https://raw.githubusercontent.com/uta8a/tomlide/main/assets/twemoji/${code}.svg`;
  try {
    await download(filePath, { file: `${basename(filePath)}`, dir: "dist" });
    console.log(`download emoji to dist/`);
  } catch {
    throw new Error("cannot get emoji from assets/");
  }
};
for (const emojiPath of postConfig.emojis) {
  await getEmoji(emojiPath.slice(2, -4));
}
