# Security & Architecture Rules for Club Scribe (Production Readiness)

## Prohibited Patterns
- Direct usage of `innerHTML = ...` without sanitization.
- Any unencrypted usage of `localStorage`, `sessionStorage`, or `IndexedDB` for sensitive data (tokens, PII). Use AES-GCM via Web Crypto with PBKDF2-derived keys.
- Usage of `dangerouslySetInnerHTML` in React without sanitization.
- Creating object URLs without revoking them: every `URL.createObjectURL(blob)` must be paired with `URL.revokeObjectURL(url)` in a `finally` block.
- Fake or mocked media processing. No fabricated transcript, waveform, or analysis data.
- Storing CSRF tokens or auth tokens in accessible global scope without protection.

## Required Patterns
- MVVM structure: keep business logic in `src/models` and `src/viewmodels`; keep `src/views` presentation-only.
- Sanitization: use `DOMPurify.sanitize` before inserting HTML; prefer `textContent` when possible.
- Web Crypto: AES-GCM for encryption, PBKDF2 for key derivation. Nonces must be unique per encryption. Store only ciphertext, iv, and salt.
- Media: Use Web Audio API / Media APIs. Speech-to-text must use Web Speech API if available; otherwise inform user that STT is unavailable (no fabricated output).
- Streams: For large files use Web Streams API; do not block main thread.
- Error handling: comprehensive `try/catch` with user-safe messages and console diagnostics.
- CSRF: If backend exists, attach CSRF header and use SameSite=Lax cookies; otherwise document why CSRF is not applicable.

## Enforcement Notes
- Replace `innerHTML` with:
  - `el.textContent = value` when plain text
  - `el.innerHTML = DOMPurify.sanitize(html)` when HTML is required
- Replace raw storage of tokens with encrypted storage helpers in `src/utils/security/crypto.ts`.
- All URLs from `URL.createObjectURL` must be revoked in `finally`.
- Charts and reports must be generated exclusively from real analysis results.

## Acceptance
- Zero direct `innerHTML` uses without sanitization.
- Zero sensitive data stored unencrypted.
- All media handling is real; no placeholders.
- Tests for XSS, performance (streaming), and STT accuracy ≥ 0.8 pass.
