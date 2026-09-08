# Security Policy

## Supported Versions

| Version | Status |
| :--- | :--- |
| **1.3.x** | [x] Active security support |
| < 1.3.0 | [-] End of life |

---

## Reporting a Vulnerability

Security and user privacy are fundamental to EchoScribe:
- In **Local Mode**, no audio data, tokens, or personal identifiers ever leave the user's host operating system.
- In **Serverless Cloud Mode**, audio payloads are buffered ephemerally in RAM `/tmp` and immediately discarded upon completion of the inference job.

If you discover a security vulnerability or credential leak within EchoScribe, please **DO NOT open a public issue**.

Instead, send a responsible disclosure email to:
- **seguridad@echoscribe.es** or **contacto@echoscribe.es**

Please include:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept.
3. Potential impact.

We will review and acknowledge your report within 48 hours and work with you to release a patch promptly.
