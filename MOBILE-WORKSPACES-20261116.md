# Mobile lesson builder, analytics and AI — 2026-11-16

The existing Persian RTL identity is preserved. Below 760px the lesson builder uses one column, a two-column block library, section shortcut links, and a separate row of 44px block actions. Form fields use 16px text to avoid small mobile inputs. Video/media settings, completion rules and preview receive narrower spacing.

Teacher and student performance views stack filters, use two-column summary metrics, and retain readable chart labels through a keyboard-accessible horizontal chart viewport. The roster scrolls within its own container. Report actions wrap without changing report data or authorization.

Shared teacher/builder AI inputs use wrapping controls, inline attachment menus, larger tap targets and bounded source lists. Student chat uses readable input text and safe-area bottom spacing. Short landscape viewports reserve more room for the composer. Desktop defaults remain unchanged.

Validation: all three portal builds and TypeScript checking passed; existing component checks passed. The local isolated Playwright browser could not launch because its cache directory remained inaccessible (EPERM). No fresh mobile screenshot verification is claimed. This is a frontend layout change; AI providers, prompts, API contracts, database data and note autosave behavior were not modified.
