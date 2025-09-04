export function Card({ children, className = "" }) {
    return <div className={`section ${className}`}>{children}</div>;
  }
  export function CardHeader({ children, className = "" }) {
    return <div className={`section-header ${className}`}>{children}</div>;
  }
  export function CardTitle({ children, className = "" }) {
    return <div className={className}>{children}</div>;
  }
  export function CardContent({ children, className = "" }) {
    return <div className={`section-body ${className}`}>{children}</div>;
  }
  