/**
 * Mock for next/dynamic — returns a passthrough component.
 * In Remotion we don't need code-splitting or SSR control.
 */

type DynamicOptions = {
  loading?: () => any;
  ssr?: boolean;
};

export default function dynamic(
  loader: () => Promise<{ default: any }>,
  _options?: DynamicOptions,
) {
  let Component: any = null;

  const DynamicComponent = (props: any) => {
    if (!Component) return null;
    return Component(props);
  };

  // Eagerly resolve for Remotion bundling
  loader()
    .then((mod) => {
      Component = mod.default || mod;
    })
    .catch(() => {});

  return DynamicComponent;
}
