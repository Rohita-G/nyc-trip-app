export function Button({ children, onClick, variant = "outline", className = "" }) {
    const cls = variant === "outline" ? "btn" : "btn primary";
    return (
      <button onClick={onClick} className={`${cls} ${className}`}>{children}</button>
    );
  }
  