interface PalindromeFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function PalindromeFallback({ reason }: PalindromeFallbackProps) {
  return (
    <div className="palindrome-fallback" data-fallback-reason={reason} aria-hidden="true">
      <div className="palindrome-fallback-room">
        <div className="palindrome-fallback-shelf" />
        <div className="palindrome-fallback-person">
          <i />
          <b />
        </div>
        <div className="palindrome-fallback-table" />
        <div className="palindrome-fallback-information">
          {[0, 1, 2, 3, 4].map((index) => (
            <span key={index} />
          ))}
        </div>
        <p>THE SAME ROOM. CLEARER RELATIONSHIPS.</p>
      </div>
    </div>
  );
}
