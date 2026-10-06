// Whether a request was made by a page on this site. Browsers say so in
// Sec-Fetch-Site. Ones too old to send it still send Origin on a POST. A
// script can fake both; this only keeps pasted links and other sites out.
export function fromThisSite(request: Request): boolean {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  return origin !== null && URL.canParse(origin) && new URL(origin).host === request.headers.get("host");
}
