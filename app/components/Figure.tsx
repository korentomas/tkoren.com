interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  size?: "small" | "medium" | "full";
}

export function Figure({ src, alt, caption, size = "full" }: FigureProps) {
  return (
    <figure className={`figure figure--${size}`}>
      <img src={src} alt={alt} loading="lazy" />
      {caption && <figcaption className="figure-caption">{caption}</figcaption>}
    </figure>
  );
}

export function ImageGrid({ children }: { children: React.ReactNode }) {
  return <div className="image-grid">{children}</div>;
}
