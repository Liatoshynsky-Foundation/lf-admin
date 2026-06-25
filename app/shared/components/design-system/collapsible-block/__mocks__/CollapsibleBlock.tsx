interface CollapsibleBlockMockProps {
  children: React.ReactNode;
  title: string;
  grip?: boolean;
}

const CollapsibleBlock = ({
  children,
  title,
  grip = false
}: CollapsibleBlockMockProps) => (
  <section data-testid="collapsible-block">
    <h2>{title}</h2>
    {grip && <div data-testid="collapsible-block-grip">Grip</div>}
    {children}
  </section>
);

export default CollapsibleBlock;
