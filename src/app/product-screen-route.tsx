/**
 * App Router leaf for a Product Face pathname.
 * GraphEditor lives in ProductWorkspaceShell (root layout), not here.
 *
 * Must return a real node. A Server Component `return null` is treated as a
 * missing `children` slot, so Next renders the builtin 404 (document.title=404)
 * while the shell still shows the Product Screen.
 */
export default function ProductScreenRoutePage() {
  return <span hidden data-product-face-route="" />;
}
