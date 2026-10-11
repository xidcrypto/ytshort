import "server-only";

/**
 * Bangun URL absolut publik dari request yang datang lewat nginx reverse proxy.
 * nginx mengirim `Host: short.hgitopup.web.id` + `X-Forwarded-Proto: https`,
 * sedangkan `request.url` berisi alamat internal (127.0.0.1:3001).
 * Memakai request.url mentah untuk redirect akan membocorkan host internal
 * ke browser (bug: Location: https://localhost:3001/).
 */
export function publicUrl(request: Request, path: string): URL {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host") ?? new URL(request.url).host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(/:$/, "");
  const base = `${proto}://${host}`;
  return new URL(path, base);
}
