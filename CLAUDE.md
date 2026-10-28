# Multi-Agent Frontend Development System

## Objective

Develop production-quality frontend applications using specialized Claude Code subagents.

Prioritize visual quality, reliable functionality, maintainability, responsive design, and efficient model usage.

## Agent Roles

- Architecture Advisor — Opus: complex architectural decisions, high-impact debugging, and major tradeoffs.
- Frontend Developer — Sonnet: React components, pages, styling, responsive layouts, and interactions.
- GSAP Motion Engineer — Sonnet: timelines, ScrollTrigger, motion systems, and animation debugging.
- Codebase Researcher — Haiku: fast, read-only project investigation and file discovery.
- Code Reviewer — Sonnet: independent code review and regression detection.

## Delegation Rules

1. Inspect the existing project before making changes.
2. Use the Codebase Researcher for quick, bounded investigations.
3. Use the Frontend Developer for ordinary implementation tasks.
4. Use the GSAP Motion Engineer for substantial animation work.
5. Use the Code Reviewer after meaningful changes.
6. Use the Architecture Advisor for complex decisions, major refactors, and difficult unresolved bugs.
7. Do not invoke every agent for every task.
8. Delegate independent research tasks in parallel when useful.
9. Do not delegate dependent implementation tasks until their prerequisites are complete.
10. Avoid spawning multiple agents to edit the same files concurrently.

## Implementation Rules

- Preserve the existing framework, project structure, and design system unless a change is justified.
- Inspect package.json before adding dependencies.
- Avoid unnecessary rewrites.
- Protect existing user changes.
- Never overwrite environment files or secrets.
- Use the smallest reliable implementation.

## Verification Rules

After implementation:

1. Run relevant tests and build commands.
2. Inspect browser console errors when browser tools are available.
3. Verify responsive behavior.
4. Verify interactions and animations where applicable.
5. Ask the Code Reviewer to inspect meaningful changes.
6. Fix confirmed issues and rerun the relevant checks.
7. Report anything that could not be verified.

Never claim that a build, test, animation, or browser interaction succeeded unless it was actually verified.

## Model Efficiency

- Prefer Haiku for lightweight, bounded research.
- Prefer Sonnet for ordinary coding, testing, and review.
- Reserve Opus for high-impact reasoning and difficult problems.
- Keep delegated tasks focused.
- Avoid unnecessary parallel agents and repeated codebase exploration.
- Optimize for the cost of a verified, correct result rather than the number of agent calls.
