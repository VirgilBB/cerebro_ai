/* Serves the XPR Gifs site at https://cerebro.host/gifs, and counts the actions
 * Cloudflare Web Analytics cannot see.
 *
 * cerebro.host is a Sitejet site proxied through Cloudflare, so we cannot deploy
 * files into it. This Worker sits on `cerebro.host/gifs*`, intercepts before the
 * request reaches Sitejet, strips the `/gifs` prefix and serves the Pages
 * deployment underneath. Every site path is relative, so the strip is all it takes.
 *
 * Pageviews are already covered -- Cloudflare injects its Web Analytics beacon into
 * these HTML responses at the edge. What it cannot see is downloads, link copies and
 * share clicks, so those are recorded here:
 *   - download links carry ?dl=1, which distinguishes a real download from the
 *     lightbox merely displaying the same .gif
 *   - copy / post-on-X fire a beacon at /gifs/__e
 * No cookies, no third-party script, nothing personal stored.
 */

const ORIGIN = 'xpr-gifs.pages.dev';
const EVENTS = new Set(['download', 'copy', 'share']);

function record(env, ctx, type, slug, request) {
  if (!env.analytics_engine || !EVENTS.has(type)) return;
  try {
    env.analytics_engine.writeDataPoint({
      // slug first so it can be grouped on in queries
      blobs: [slug || 'unknown', type, request.headers.get('cf-ipcountry') || 'XX'],
      doubles: [1],
      indexes: [type],
    });
  } catch (err) {
    // Never let analytics break the actual response.
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Relative asset paths only resolve correctly under a trailing slash.
    if (url.pathname === '/gifs') {
      return Response.redirect(url.origin + '/gifs/', 301);
    }

    // Beacon endpoint. Returns an empty 204 -- nothing to render.
    if (url.pathname === '/gifs/__e') {
      record(env, ctx, url.searchParams.get('ev'), url.searchParams.get('slug'), request);
      return new Response(null, {
        status: 204,
        headers: { 'cache-control': 'no-store' },
      });
    }

    const path = url.pathname.replace(/^\/gifs/, '') || '/';

    if (url.searchParams.get('dl') === '1' && path.endsWith('.gif')) {
      const slug = path.split('/').pop().replace(/\.gif$/, '');
      record(env, ctx, 'download', slug, request);
    }

    const upstream = new URL(url);
    upstream.hostname = ORIGIN;
    upstream.protocol = 'https:';
    upstream.port = '';
    upstream.pathname = path;
    upstream.search = '';   // ?dl=1 is ours; do not bust the Pages cache with it

    const res = await fetch(new Request(upstream, request));

    // Body streams through untouched; headers are copied so the Pages _headers
    // rules (immutable asset caching, CORS) survive the hop.
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: res.headers,
    });
  },
};
