# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal staff of a single government agency, split into four fixed roles:

- **Admin Kepegawaian** — the main daily operator. Creates and edits Perjalanan Dinas, maintains Pegawai and Unit Kerja, prints SPPD, verifies post-trip files.
- **Pejabat Penyetuju** — approves or rejects trips with a reason, signs the SPPD.
- **Pegawai** — sees own calendar and history, fills the Laporan Perjalanan Dinas, uploads Dokumentasi Perjalanan.
- **Super Admin** — manages accounts/roles and agency settings (letterhead, numbering format).

Accounts are created by Super Admin. There is no self-registration, and one person holds exactly one role. Primary working context is desktop/laptop in an office; a 360 px layout is a documented responsive constraint, not evidence that phones are the main device.

## Product Purpose

SIJALAN manages employee official travel (Perjalanan Dinas) end to end: recording the trip, approving it, issuing a numbered SPPD, then closing it with a trip report and photo documentation.

It replaces spreadsheets and Word documents, where schedules were hard to monitor, SPPD numbers were inconsistent, and reports/photos arrived late or went missing. Success for the MVP is one complete loop that can be demonstrated without manual database edits: Admin creates → Pejabat approves → numbered SPPD prints → Pegawai reports and uploads photos → Admin verifies and closes → everything visible on the calendar.

This repository is a **demo/portfolio build for a coding exercise**, not a live agency deployment.

## Positioning

One internal app that carries a single Perjalanan Dinas from assignment to archived evidence, where the SPPD is generated from stored data instead of retyped, the calendar is the single schedule truth, and a trip cannot close until its report and at least one photo exist. Competing approaches are spreadsheets plus word-processor templates, which cannot enforce numbering, approval trail, or file completeness.

## Operating Context

- Indonesian agency practice: Perjalanan Dinas, SPPD, Sumber Dana, Unit Kerja, Rincian Biaya, Verifikasi Pemberkasan, and the surrounding document rituals.
- Whole interface is Bahasa Indonesia; dates use `d F Y`; timezone Asia/Jakarta.
- Printed artifacts matter: SPPD letterhead (kop), cost breakdown, signature block; the browser print dialog / "Save as PDF" is the delivery mechanism.
- Demo environment: seeded accounts (`password`), 12 employees, 25 trips over three recent months, including two completed trips with report and photos. A daily scheduler advances `Disetujui` → `Berlangsung` at 00:05.

## Capabilities and Constraints

- Confirmed MVP scope: authentication and roles, master data (Unit Kerja, Pegawai, settings), trip CRUD with cost lines and conflict validation, approval plus SPPD numbering and print page, monthly calendar per employee and per unit, trip report plus photo documentation and completion verification, dashboard with monthly figures and a per-unit bar chart.
- Status machine: `Draft` → `Diajukan` → `Disetujui` → `Berlangsung` → `Selesai`, with `Ditolak` (returns to `Diajukan` after correction) and `Dibatalkan`. `Selesai` requires a filled report, at least one photo, and an end date that has passed.
- Deliberate constraints: single tenant; one trip maps to exactly one employee (no collective SPPD); only Admin/Super Admin create trips; signature is an uploaded image stored on a private disk and served through an authenticated route; documentation is on the public disk.
- Explicit non-goals for the MVP: payments/SPJ, Surat Tugas, collective SPPD, SIMPEG integration, multi-tenant SaaS, multi-level approval, email/WhatsApp notifications, Excel export, calendar drag-and-drop, certified e-signature.
- Undecided product facts: the real institution name, logo, and letterhead; the production host/deploy target; whether the product ever goes beyond the demo.
- Stack is answered by the existing codebase (Laravel 13 / PHP 8.4, Inertia, React 19, TypeScript, Vite, Tailwind 4, SQLite by default).

## Brand Commitments

- Name: **SIJALAN** (Sistem Informasi Perjalanan Dinas).
- Indonesian-only voice across the interface.
- Placeholder agency identity `Instansi Pemerintah` in settings; no real logo asset exists. Treat as placeholder, never as a real client.

## Evidence on Hand

- Product requirements: `docs/PRD.md`; implementation status: `docs/TASKS.md`; domain vocabulary: `CONTEXT.md`; decisions: `docs/adr/`.
- Real content available: the seeded demo dataset and the implemented flows in `app/` and `resources/js/`.
- Absent, and must not be fabricated: real agency identity, real users, testimonials, press, benchmarks, or production usage numbers.

## Product Principles

1. One complete, demonstrable loop is worth more than several half-built modules.
2. Official documents are generated from stored data, never retyped.
3. Completeness is enforced, not reminded: a trip cannot close without its report and evidence.
4. Roles follow real agency responsibility — Admin prepares, Pejabat authorizes, Pegawai accounts for the trip.
5. The demo must run from seed data with no manual database intervention.

## Accessibility & Inclusion

Adequate text contrast, labeled controls, and a keyboard-operable calendar are stated requirements. Layout must stay comfortable from 360 px upward, with the calendar allowed to scroll horizontally on small screens.
