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
            MILK <b>62.00</b>
          </span>
          <span>
            BREAD <b>48.00</b>
          </span>
          <span>
            GROCERIES <b>110.00</b>
          </span>
        </div>
        <p>THE SAME ROOM. CLEARER RELATIONSHIPS.</p>
      </div>
    </div>
  );
}
