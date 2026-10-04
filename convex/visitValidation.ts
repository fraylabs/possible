const paths = new Set(["/", "/docs", "/docs/how-to-use", "/docs/authoring", "/docs/reference", "/publish", "/saved", "/outcomes/view"]);

export function validVisitPath(path: string) {
  return path.length <= 64 && paths.has(path);
}

export function validReferrerHost(host: string) {
  return host === "" || (host.length <= 253
    && /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(host));
}

export function validUtm(value: string) {
  return value === "" || /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/.test(value);
}
