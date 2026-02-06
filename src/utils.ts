
export function getPath(path: string): string {
    const base = import.meta.env.BASE_URL;
    if (base === '/') return path;
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${cleanBase}${path.startsWith('/') ? path : '/' + path}`;
}
