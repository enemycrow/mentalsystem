import { useState, type ReactNode } from 'react';

interface TipBoxProps {
  title: string;
  content: ReactNode;
}

export default function TipBox({ title, content }: TipBoxProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`tipbox ${expanded ? 'expanded' : ''}`}>
      <button
        className="tipbox-header"
        onClick={() => setExpanded(!expanded)}
        type="button"
      >
        <span className="tipbox-icon">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18h6M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 01-1 1h-6a1 1 0 01-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" />
          </svg>
        </span>
        <span className="tipbox-title">{title}</span>
        <span className={`tipbox-chevron ${expanded ? 'rotated' : ''}`}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </span>
      </button>
      {expanded && <div className="tipbox-content">{content}</div>}
    </div>
  );
}
