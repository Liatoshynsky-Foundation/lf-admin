const CollapsibleBlock = ({
  children,
  title
}: {
  readonly children: React.ReactNode;
  readonly title: string;
}) => (
  <section data-testid="collapsible-block">
    <h2>{title}</h2>
    {children}
  </section>
);

export default CollapsibleBlock;
