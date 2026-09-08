# Contributing to EchoScribe

We welcome contributions. Whether you want to improve subtitle ergonomics, benchmark new GPU backends, fix a bug, or enhance documentation, your help is appreciated.

---

## How to Get Started

1. **Fork the Repository:** Click the "Fork" button at the top right of this repository.
2. **Clone your Fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/EchoScribe.git
   cd EchoScribe
   ```
3. **Set up your Virtual Environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. **Run the Test Suite & Algorithmic Demo:**
   ```powershell
   python quickstart_demo.py
   pytest test_quickstart.py
   ```

---

## Code Style & Guidelines

- **PEP 8 Compliance:** Keep Python code formatted and clean.
- **Timestamp Integrity:** Never modify subtitle timing calculations without verifying against multi-frame alignment tests.
- **Dual-Language Documentation:** If you make significant architectural changes, please update both `README.md` and `README_ES.md`.
- **Privacy First:** Never log raw user audio or API credentials to stdout.

---

## Submitting a Pull Request

1. Create a dedicated feature branch:
   ```bash
   git checkout -b feature/smart-srt-improvements
   ```
2. Commit your changes with clear, descriptive messages:
   ```bash
   git commit -m "feat(srt): enhance CPL elastic boundary for German compound words"
   ```
3. Push to your fork:
   ```bash
   git push origin feature/smart-srt-improvements
   ```
4. Open a Pull Request on GitHub against the `main` branch.

---

## Issues & Feature Requests

Please open an issue using one of our GitHub templates:
- [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)

For commercial or sponsorship queries, visit our official website: [https://www.echoscribe.es](https://www.echoscribe.es).
