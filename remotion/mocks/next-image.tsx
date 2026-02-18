/**
 * Mock for next/image — renders a plain <img> in Remotion.
 * Remotion has no Next.js image optimization server, so we
 * replace <Image> with a standard HTML image element.
 */
import React from 'react';

interface MockImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: string;
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const MockImage: React.FC<MockImageProps> = ({
  src,
  alt,
  width,
  height,
  fill,
  className,
  style,
  ...rest
}) => {
  const imgStyle: React.CSSProperties = { ...style };

  if (fill) {
    imgStyle.position = 'absolute';
    imgStyle.inset = 0;
    imgStyle.width = '100%';
    imgStyle.height = '100%';
    imgStyle.objectFit = (style as any)?.objectFit || 'cover';
  }

  return (
    <img
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      className={className}
      style={imgStyle}
    />
  );
};

export default MockImage;

