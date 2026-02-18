/**
 * Mock for next/link — renders a plain <a> tag in Remotion.
 */
import React from 'react';

interface MockLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: any;
}

const MockLink: React.FC<MockLinkProps> = ({
  href,
  children,
  className,
  style,
  prefetch,
  ...rest
}) => {
  return (
    <a href={href} className={className} style={style} {...rest}>
      {children}
    </a>
  );
};

export default MockLink;

