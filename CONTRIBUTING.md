# Contributing Guidelines

Thank you for your interest in contributing to this project.

This repository hosts a **curated dataset and interactive atlas of Marian apparitions**,
grounded in official ecclesiastical documentation and explicit editorial criteria.

Contributions are welcome — **provided they respect the scope, methodology, and purpose
of the project**.

---

## Ways to Contribute

You may contribute in the following ways:

### 1. Dataset Improvements
- Adding new documented apparitions
- Correcting factual errors (dates, locations, names)
- Improving source references
- Updating canonical or ecclesiastical status when officially changed

### 2. Code Improvements
- Bug fixes
- UI/UX improvements
- Accessibility enhancements
- Performance optimizations
- Refactoring (must preserve behavior)

### 3. Documentation
- Improving README, SECURITY.md, or CONTRIBUTING.md
- Clarifying editorial criteria
- Improving inline code comments

---

## Editorial Principles (Very Important)

This project follows **explicit editorial rules**.

Before submitting changes to the dataset, ensure that:

- Every apparition is **documented**
- Sources are **clearly identified**
- Authority level is **explicitly classified**
- No theological interpretation is added by contributors

### Accepted Source Types

- **Holy See documents** (Vatican.va)
- **Official diocesan documents**
- **Official shrine or episcopal conference websites**

Secondary sources (e.g. Wikipedia, blogs) may be used **only as supplemental references**
and must be clearly marked as such.

---

## Authority Levels

Each apparition must be classified using one of the following values:

- `holy_see` — Explicitly approved or recognized by the Holy See
- `diocesan_approved` — Approved by a local bishop or diocese
- `under_investigation` — Officially under ecclesiastical investigation
- `not_recognized` — Explicitly not recognized or lacking official approval

If the authority level is **unclear or disputed**, the apparition must be marked
as `under_investigation`.

---

## Dataset Contribution Process

1. Fork the repository
2. Create a new branch (`feature/add-apparition-xyz`)
3. Edit the dataset file(s)
4. Ensure:
   - Unique `id`
   - Valid geographic coordinates
   - Correct `canonicalRank`
   - At least one official source (when available)
5. Run validation scripts (if applicable)
6. Submit a Pull Request with a **clear explanation and sources**

---

## Pull Request Guidelines

Please ensure that your Pull Request:

- Has a clear and descriptive title
- Explains **what changed and why**
- References official sources when modifying data
- Does not mix unrelated changes
- Does not introduce breaking changes without discussion

Pull Requests that do not follow these guidelines may be closed without merge.

---

## Issues & Discussions

- Use **Issues** for bugs, corrections, or dataset improvements
- Use **Discussions** (if enabled) for questions or clarification
- **Do not** use Issues for doctrinal or theological debates

This project documents history and sources — it does not arbitrate belief.

---

## Code Style & Quality

- Keep code simple and readable
- Avoid unnecessary dependencies
- Prefer clarity over cleverness
- Preserve the existing architectural patterns

---

## Licensing

By contributing to this project, you agree that your contributions will be licensed
under the same license as the project:

**Creative Commons Attribution–NonCommercial–ShareAlike 4.0 International**

---

## Code of Conduct

Contributors are expected to engage respectfully and professionally.

Disrespectful behavior, harassment, or ideological hostility will not be tolerated.

---

Thank you for contributing thoughtfully and responsibly.
