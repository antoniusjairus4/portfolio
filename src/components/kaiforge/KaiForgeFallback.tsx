import { kaiForgeContent } from '@/content/kaiforge';

export function KaiForgeFallback({
  reason,
}: {
  reason: 'reduced-motion' | 'no-webgl' | 'asset-unavailable';
}) {
  return (
    <div className="kaiforge-fallback" data-fallback-reason={reason}>
      <div className="kaiforge-fallback-stage" aria-hidden="true">
        <div className="kaiforge-fallback-player">
          <span className="kaiforge-fallback-head" />
          <span className="kaiforge-fallback-body" />
          <span className="kaiforge-fallback-arm" />
          <span className="kaiforge-fallback-paddle" />
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
