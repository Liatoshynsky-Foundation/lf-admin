/**
 * Mock for next/link in Storybook.
 */
import React from 'react';

const Link = React.forwardRef<
  HTMLAnchorElement,
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string; passHref?: boolean; legacyBehavior?: boolean }
>(({ href, passHref: _passHref, legacyBehavior: _legacyBehavior, children, ...props }, ref) => {
  return (
    <a ref={ref} href={href} {...props}>
      {children}
    </a>
  );
});

Link.displayName = 'MockNextLink';
export default Link;
