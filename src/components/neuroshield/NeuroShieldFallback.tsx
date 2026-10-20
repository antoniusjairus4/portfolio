interface NeuroShieldFallbackProps {
  reason: 'reduced-motion' | 'no-webgl';
}

export function NeuroShieldFallback({ reason }: NeuroShieldFallbackProps) {
  return (
    <div className="neuroshield-fallback" data-fallback-reason={reason} aria-hidden="true">
      <div className="neuroshield-fallback-field">
        <svg
          className="neuroshield-fallback-brain"
          viewBox="0 0 500 400"
          fill="none"
          role="img"
          aria-label="Stylized anatomical brain illustration"
        >
          <path
            d="M249 71 C209 35 149 58 127 94 C68 85 45 143 62 176 C32 218 59 265 98 275 C99 324 141 346 179 333 C203 363 234 348 249 332 C264 348 295 363 319 333 C357 346 399 324 400 275 C439 265 466 218 436 176 C453 143 430 85 371 94 C349 58 289 35 249 71 Z"
            fill="#E8DDC8"
            stroke="#F7F2E7"
            strokeWidth="5"
          />
          <path
            d="M76 208 C93 165 145 151 184 173 C220 199 224 271 187 307 C155 339 113 315 99 276 C67 262 61 232 76 208 Z"
            fill="#B77A86"
            opacity=".45"
          />
          <path
            d="M313 93 C359 70 406 100 423 149 C430 185 404 209 367 202 C329 193 288 135 313 93 Z"
            fill="#6EA7AE"
            opacity=".5"
          />
          <path
            d="M309 269 C350 241 389 269 384 304 C373 335 327 351 293 326 Z"
            fill="#D3A45E"
            opacity=".42"
          />
          <path
            d="M249 70 L249 329 M132 97 C175 113 161 151 134 165 C99 186 126 216 170 207 M91 263 C135 245 151 274 143 312 M176 88 C214 116 191 149 170 157 M203 177 C169 186 176 231 218 236 M334 91 C287 110 298 148 330 158 C364 177 344 214 308 212 M410 264 C366 244 346 274 356 312 M289 177 C328 187 316 232 280 238"
            stroke="#8E897F"
            strokeWidth="4"
            strokeLinecap="round"
            opacity=".5"
          />
          <path
            d="M179 334 C187 375 223 381 249 363 C275 381 311 375 319 334"
            stroke="#D4C2A7"
            strokeWidth="20"
            strokeLinecap="round"
          />
        </svg>
        <div className="neuroshield-fallback-scan" />
        <span>ANATOMY / IMAGING / RESEARCH</span>
      </div>
    </div>
  );
}
