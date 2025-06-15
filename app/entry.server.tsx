import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext,
) {
  let shellRendered = false;
  const userAgent = request.headers.get("user-agent");

  const body = await renderToReadableStream(
    <ServerRouter context={routerContext} url={request.url} />,
    {
      onError(error: unknown) {
        responseStatusCode = 500;
        // Log streaming rendering errors from inside the shell
        if (shellRendered) {
          console.error("Streaming render error:", error);
        }
      },
      onShellError(error: unknown) {
        // Log shell rendering errors
        console.error("Shell render error:", error);
        responseStatusCode = 500;
      },
    },
  );
  
  shellRendered = true;

  // Wait for bots and SPA mode to fully load content
  if ((userAgent && isbot(userAgent)) || routerContext.isSpaMode) {
    await body.allReady;
  }

  // Set proper headers for Cloudflare Workers
  responseHeaders.set("Content-Type", "text/html; charset=utf-8");
  responseHeaders.set("Cache-Control", "public, max-age=300, s-maxage=3600");
  
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
