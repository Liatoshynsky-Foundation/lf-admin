interface CollapsibleBlockMockProps {
  children: React.ReactNode;
  title: string;
  grip?: boolean;
  hidden?: boolean;
  onToggleVisibility?: () => void;
}

const CollapsibleBlock = ({
  children,
  title,
  grip = false,
  hidden = false,
  onToggleVisibility
}: CollapsibleBlockMockProps) => (
  <section data-testid="collapsible-block" data-hidden={hidden}>
    <h2>{title}</h2>
    {grip && <div data-testid="collapsible-block-grip">Grip</div>}
    {onToggleVisibility && (
      <button
        type="button"
        data-testid="collapsible-block-toggle-visibility"
        aria-label={hidden ? 'Показати розділ' : 'Приховати розділ'}
        onClick={onToggleVisibility}
      >
        Toggle visibility
      </button>
    )}
    {children}
  </section>
);

export default CollapsibleBlock;
