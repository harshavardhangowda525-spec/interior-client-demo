/** Resolves a file in /public against the deploy base (e.g. GitHub Pages sub-path). */
export const asset = (path: string) => import.meta.env.BASE_URL + path.replace(/^\//, '')
