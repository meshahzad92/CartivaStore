# DECISIONS.md — Architecture Decision Records

> Decisions made during the life of this project.

---

## ADR-001: Cash-on-Delivery Only
**Date**: Initial setup
**Decision**: No payment gateway integration. All orders are COD.
**Rationale**: Pakistan e-commerce market is predominantly COD. Simplifies checkout UX significantly.
**Status**: Accepted

---

## ADR-002: SQLite for Initial Development
**Date**: Initial setup
**Decision**: Use SQLite file-based database for development and early production.
**Rationale**: Zero infrastructure dependency; fast to iterate. Alembic configured for future PostgreSQL migration.
**Status**: Active — revisit when concurrent write load increases

---

## ADR-003: Single Admin User via .env
**Date**: Initial setup
**Decision**: Single admin account, credentials stored in `.env` (ADMIN_EMAIL, ADMIN_PASSWORD).
**Rationale**: No multi-user requirement at this stage. Simplest possible auth with JWT.
**Status**: Active — revisit if multiple staff need access

---

## ADR-004: PostEx API Token Dual-Source
**Date**: PostEx Settings phase
**Decision**: PostEx API token can come from `.env` (POSTEX_API_KEY) OR from the DB (PostexSettings.token). DB takes priority.
**Rationale**: Allows changing the token from admin UI without server restart.
**Status**: Accepted

---

## ADR-005: Backend-Authoritative Pricing
**Date**: Initial setup
**Decision**: Backend recalculates order total from DB prices; frontend prices are display-only.
**Rationale**: Prevents price manipulation by clients.
**Status**: Accepted
