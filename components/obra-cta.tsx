"use client";

import "./obra-cta.css";

type ObraCTAProps = {
  label?: string;
  hint?: string;
  onClick?: () => void;
};

export default function ObraCTA({
  label = "Explore Government Schemes",
  hint = "your next step starts here",
  onClick,
}: ObraCTAProps) {
  return (
    <div className="obra-cta-frame">
      <button type="button" className="obra-cta" onClick={onClick}>
        <span className="obra-cta__label">{label}</span>
        <span className="obra-cta__arrow" aria-hidden="true">
          →
        </span>
      </button>
      <p className="obra-cta__hint">
        <em>Setuva</em> — {hint}
      </p>
    </div>
  );
}
