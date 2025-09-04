import { useState } from "react";

export function Accordion({ children }) {
  return <div>{children}</div>;
}
export function AccordionItem({ children }) {
  return <div className="ac-item">{children}</div>;
}
export function AccordionTrigger({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ac-trigger" onClick={() => setOpen(!open)} data-open={open}>
      <span>{children}</span>
      <span>{open ? "▾" : "▸"}</span>
    </div>
  );
}
export function AccordionContent({ children }) {
  return <div className="ac-content">{children}</div>;
}
