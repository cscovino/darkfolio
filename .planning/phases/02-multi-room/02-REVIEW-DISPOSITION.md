---
phase: 02
review: 02-REVIEW.md
titles: json
findings:
  - id: WR-01
    severity: warning
    disposition: open
    title: "Door side is chosen from the instantaneous facing with no entry-side check (one-frame reversal fires the opposite side)"
  - id: WR-03
    severity: warning
    disposition: skipped
    title: "The Phase-1 export contract re-exports were deleted from `LivingRoomScene.ts`"
  - id: IN-04
    severity: info
    disposition: open
    title: "Handle pass fires on a raw key hold with no net-movement check"
  - id: IN-05
    severity: info
    disposition: skipped
    title: "The keep-last-room-on-null invariant lost its runnable test"
  - id: IN-06
    severity: info
    disposition: open
    title: "The cross-door rest-spot trigger-window assertions were deleted"
  - id: IN-07
    severity: info
    disposition: open
    title: "Rest-spot clearance assertions never check walls, though T-02-01 claims they do"
  - id: WR-02
    severity: warning
    disposition: fixed
    title: "Glide relies solely on tween `onComplete` to restore physics/input"
  - id: IN-01
    severity: info
    disposition: skipped
    title: "Glide distance (48px / 3 tiles) vs. context \"~2 tiles\""
  - id: IN-02
    severity: info
    disposition: skipped
    title: "`currentRoom` is stale for the duration of a glide"
  - id: IN-03
    severity: info
    disposition: skipped
    title: "`LivingRoomScene` hosts all three rooms"
open: 4
total: 10
recorded: 2026-11-04T19:46:07.222Z
---

# Phase 02: Code Review Disposition

| Finding | Severity | Disposition | Source |
|---------|----------|-------------|--------|
| WR-01 | warning | open | - |
| WR-03 | warning | skipped | accepted via verification override 2026-11-04 (02-VERIFICATION.md overrides: — maintainer accepted the contract drift) |
| IN-04 | info | open | - |
| IN-05 | info | skipped | accepted via verification override 2026-11-04 (02-VERIFICATION.md overrides: — maintainer accepted the contract drift) |
| IN-06 | info | open | - |
| IN-07 | info | open | - |
| WR-02 | warning | fixed | re-review 2026-11-04: SHUTDOWN teardown restores body/gliding/timers (02-REVIEW.md Prior Finding Dispositions) |
| IN-01 | info | skipped | re-review 2026-11-04: obsolete — matches locked D-14/D-11 behaviour (02-REVIEW.md Prior Finding Dispositions) |
| IN-02 | info | skipped | re-review 2026-11-04: obsolete — matches locked D-14/D-11 behaviour (02-REVIEW.md Prior Finding Dispositions) |
| IN-03 | info | skipped | re-review 2026-11-04: obsolete — matches locked D-14/D-11 behaviour (02-REVIEW.md Prior Finding Dispositions) |

Dispositions: `open` (recorded, not yet triaged), `fixed`, `skipped`, `deferred`.
Set `deferred` by hand and put the reason in the Source cell; both are preserved. A `|` in the reason is kept as prose and escaped on the next run.
Re-running the gate keeps every row it can. A row the current review no longer reports is kept and its Source cell flagged, so a finding does not leave this record silently. ONE exception: when a finding id is REUSED by a different finding, the earlier decision cannot keep a row — the id is taken — and it is dropped. A RECORDED decision (anything but `open`) is named on the console when that happens; a row still at `open` is replaced silently, because `open` records no decision to lose.
