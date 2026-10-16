interface NeuroShieldFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function NeuroShieldFallback({ reason }: NeuroShieldFallbackProps) {
  return (
    <div className="neuroshield-fallback" data-fallback-reason={reason} aria-hidden="true">
      <div className="neuroshield-fallback-field">
        <span className="evidence-plane evidence-plane-a">OBS / A</span>
        <span className="evidence-plane evidence-plane-b">EXP / 02</span>
        <span className="evidence-plane evidence-plane-c">RUN / B</span>
        <i className="evidence-node node-a" />
        <i className="evidence-node node-b" />
        <i className="evidence-node node-c" />
        <i className="evidence-node node-d" />
        <b className="evidence-path path-a" />
        <b className="evidence-path path-b" />
        <b className="evidence-path path-c" />
        <b className="evidence-path path-gap-a" />
        <b className="evidence-path path-gap-b" />
        <em>MORE EVIDENCE. MORE QUESTIONS.</em>
      </div>
    </div>
  );
}
