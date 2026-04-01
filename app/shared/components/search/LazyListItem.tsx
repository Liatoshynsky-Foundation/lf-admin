import React from 'react';

export const VirtualizedListbox = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLElement>>(
  function VirtualizedListbox(props, ref) {
    return <ul ref={ref} {...props} />;
  }
);
