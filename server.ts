import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { extname } from "https://deno.land/std@0.126.0/path/mod.ts";
const ext = (s: string): string => {
  const ext = extname(s);
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".png") return "image/png";
  if (ext === ".jpg") return "image/jpg";
  return "text/plain";
};
async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  console.log(pathname);

  if (pathname === "/") {
    return new Response(await Deno.readFileSync("dist/index.html"), {
      headers: {
        "content-type": "text/html; charset=UTF-8",
      },
    });
  }
  return new Response(await Deno.readFileSync(`dist/${pathname}`), {
    headers: {
      "content-type": ext(pathname),
    },
  });
}

console.log("Listening on http://localhost:8000");
serve(handleRequest);
