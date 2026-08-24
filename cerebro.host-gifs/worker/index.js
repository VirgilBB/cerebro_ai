/* Serves the XPR Gifs site at https://cerebro.host/gifs.
 *
 * cerebro.host is a Sitejet site proxied through Cloudflare, so we cannot deploy
 * files into it. This Worker sits on the route `cerebro.host/gifs*`, intercepts
 * before the request reaches Sitejet, strips the `/gifs` prefix and serves the
 * Pages deployment underneath.
 *
 * Every path in the site is relative, so the prefix strip is all that is needed:
 *   /gifs/                    -> /
 *   /gifs/assets/gif/x.gif    -> /assets/gif/x.gif
 *   /gifs/g/<slug>/           -> /g/<slug>/
 */

const ORIGIN = 'xpr-gifs.pages.dev';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Relative asset paths only resolve correctly under a trailing slash.
    if (url.pathname === '/gifs') {
      return Response.redirect(url.origin + '/gifs/', 301);
    }

    const upstream = new URL(url);
    upstream.hostname = ORIGIN;
    upstream.protocol = 'https:';
    upstream.port = '';
    upstream.pathname = url.pathname.replace(/^\/gifs/, '') || '/';

    const res = await fetch(new Request(upstream, request));

    // Body is streamed through untouched; headers are copied so the Pages
    // _headers rules (immutable asset caching, CORS) survive the hop.
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  },
};
