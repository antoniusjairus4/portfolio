interface PalindromeFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function PalindromeFallback({ reason }: PalindromeFallbackProps) {
  return (
    <div className="palindrome-fallback" data-fallback-reason={reason} aria-hidden="true">
      <div className="palindrome-fallback-room">
        <div className="palindrome-fallback-window" />
        <div className="palindrome-fallback-shelf">
          <i />
          <i />
          <i />
        </div>
        <div className="palindrome-fallback-person">
          <i />
          <b />
        </div>
        <div className="palindrome-fallback-table">
          <i />
        </div>
        <div className="palindrome-fallback-information">
          <span>
            MILK COSTS 30% MORE
            <br />
            THAN LAST WEEK
          </span>
          <span>
            ₹420 LEFT
            <br />
            IN YOUR WEEKLY BUDGET
          </span>
        </div>
        <p>THE SAME ROOM. CLEARER RELATIONSHIPS.</p>
      </div>
    </div>
  );
}
