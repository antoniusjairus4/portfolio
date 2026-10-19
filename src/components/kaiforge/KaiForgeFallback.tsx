import { kaiForgeContent } from '@/content/kaiforge';

export function KaiForgeFallback({
  reason,
}: {
  reason: 'reduced-motion' | 'no-webgl' | 'asset-unavailable';
}) {
  return (
    <div className="kaiforge-fallback" data-fallback-reason={reason}>
      <div className="kaiforge-fallback-stage" aria-hidden="true">
        <div className="kaiforge-fallback-player" style={{ transform: 'none' }}>
          <svg viewBox="0 0 180 220" width="100%" height="100%" aria-hidden="true">
            <path
              d="M15 207 L20 192 H73 L83 207 V216 H15 Z M28 192 L35 147 H61 L72 192 Z"
              fill="#414a43"
            />
            <path
              d="M38 146 L20 53 L41 48 L59 142 Z M31 42 L132 64 L128 81 L27 62 Z"
              fill="#414a43"
              stroke="#73796e"
              strokeWidth="3"
            />
            <g fill="#232b24" stroke="#b9ad94" strokeWidth="3">
              <circle cx="48" cy="145" r="16" />
              <circle cx="29" cy="51" r="15" />
              <circle cx="130" cy="72" r="8" />
            </g>
            <path d="M130 72 L136 47" stroke="#73796e" strokeWidth="5" />
            <ellipse cx="139" cy="35" rx="9" ry="16" fill="#232b24" stroke="#b9ad94" />
          </svg>
        </div>
        <div className="kaiforge-fallback-table">
          <span className="kaiforge-fallback-net" />
        </div>
        <div className="kaiforge-fallback-trace" />
        <div className="kaiforge-fallback-ball" />
      </div>
      <div className="kaiforge-fallback-copy">
        <p>01 / Recognition</p>
        <h3>The point begins as movement.</h3>
      </div>
      <div className="kaiforge-fallback-copy kaiforge-fallback-copy-final">
        <p>04 / Understanding</p>
        <h3>The point, understood.</h3>
        <span>{kaiForgeContent.traceNote}</span>
      </div>
    </div>
  );
}
