# Repository instructions

## Authoritative documents

Before planning or changing behavior, read the authority for that kind of decision:

- Competition participation, submission, and tool requirements: the event-provided `RULE.md` (in the repository root or `docs/` when present, otherwise the user-provided source). The original is authoritative; recheck current event details and deadlines instead of assuming dates in this summary remain current.
- Judging priorities and weights: the event-provided `judgement-criteria.md` (in the repository root or `docs/` when present, otherwise the user-provided source). The original is authoritative.
- Visual design: [`docs/DESIGN.md`](docs/DESIGN.md). Treat it as design guidance and respect its evidence and scope limits; it does not define product features.
- Product behavior: [`docs/PRD.md`](docs/PRD.md) defines user needs, flows, scope, and acceptance criteria.
- Technical implementation: [`docs/TRD.md`](docs/TRD.md) describes the proposed stack, architecture, interfaces, deployment, and verification. Its explicitly unconfirmed recommendations are not settled decisions.

### Confirmed competition requirements

These are concise reminders from the user-provided event sources, not replacements for the originals. If an original is unavailable or a detail conflicts, obtain and follow the current source rather than guessing.

- Build a web app and deploy it to Azure; implementation language is unrestricted. Use only VS Code with GitHub Copilot, GitHub Copilot CLI, and/or the GitHub Copilot app for AI coding. Do not use third-party AI coding tools.
- GitHub Copilot SDK and Microsoft Agent Framework are both required evaluation technologies. Use them correctly and meaningfully in the application's core; do not treat incidental or superficial integration as sufficient. Azure AI or another Azure model service is not itself required.
- Follow the entry sequence: check in, have every participant register their GitHub handle (not email, without `@`), then have the team lead register the team before submitting the app. A team has 1–4 members including the lead; a participant may belong to one team, and team names must be unique.
- The team lead submits from a public GitHub repository they own. The repository root must contain `PRD.md` and `TRD.md`; submit the judged commit hash and deployed app URL. Keep these root submission documents aligned with the product and technical authority documents in `docs/`, not divergent copies.
- Use an Azure-provided default domain (for example `*.azurewebsites.net`, `*.azurecontainerapps.io`, or `*.azurestaticapps.net`); custom domains are not accepted. Make core app functionality available to reviewers without login, invitations, or separate credentials. If access restrictions prevent evaluation, every judging category receives the minimum score (1 point).
- Never put passwords, tokens, or other credentials in public submission issues. For submission problems, check the issue comments and `complete`/`invalid` labels. Recheck the original RULE for the current deadline, submission limits, and event instructions; do not hardcode a date from a past event.

### Judging priorities

Use the weights below to guide tradeoffs; the full criteria and clarifications are in `judgement-criteria.md`.

| Priority | Weight | Focus |
|---|---:|---|
| GitHub Copilot SDK + Microsoft Agent Framework | 25% | Both are core; depth of model connection, agent orchestration, tools, context, and streaming matters more than feature count. |
| Productivity impact and problem fit | 18% | A concrete user/problem and demonstrated practical impact. |
| Azure integration | 18% | Meaningful real deployment, secure cloud-native use, repeatability, reliability, and observability; unnecessary services can hurt. |
| Feature completeness and technical implementation | 16% | End-to-end behavior, quality, architecture, errors, performance, and platform fit. |
| UX and workflow | 12% | Clarity, natural AI integration, latency/error handling, transparency, accessibility, and user control. |
| Responsible AI, security, and trust | 6% | Clear AI labeling, confirmation for risky actions, privacy, hallucination and prompt-injection mitigation, and secret handling. |
| Innovation and originality | 5% | Creative AI use that improves productivity beyond copying existing tools. |

## Resolving conflicts

Use each document only for its stated role; do not guess missing requirements or use one document as a substitute for another. If event rules, judging criteria, product requirements, technical design, or visual design conflict, pause the affected work and resolve the conflict with the relevant authority document before proceeding. Keep this guide as routing guidance and a concise compliance reminder, not a duplicate specification. When a proposal in the TRD is unconfirmed or conflicts with an agreed requirement, verify and resolve it with the team and update the relevant authority document rather than silently treating the proposal as final.
