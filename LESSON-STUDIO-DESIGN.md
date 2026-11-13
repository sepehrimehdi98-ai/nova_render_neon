# Lesson editor visual reference

Source: user-provided photo_31251214709_x.jpeg, 12 Nov 2026.
Scope: current Render/Neon teacher lesson creation only. Liara, student/admin dashboards and saved production records remain separate.

Visual contract: full-width Persian RTL light editor; blue primary actions; horizontal header with Nova brand, breadcrumbs, title, preview and save; right content-block library; central editable lesson block canvas; left AI conversation and reference/file controls; bottom linked exam, lesson name, chapter, description and save/publish controls. Vazirmatn self-hosted font remains active. Narrow widths stack the panels and preserve every control.

Preserved features: actual save/publish API, real media/Kavimo input and preview, image blocks, source approval/file controls, selected-font marks, extra block types, accessible move buttons, exam creation navigation, cover picker and metadata. Source and advanced controls use disclosure sections to preserve the reference's hierarchy. Chapter selector saves through the existing scoped organization API. The sample AI conversation is not fabricated; an apply action is disabled until a real answer exists.

Static video cover is a Python-themed display, not proof that the configured video itself teaches variables. Clicking it opens the actual configured/sample media player. Python logo source: https://www.python.org/static/community_logos/python-logo-generic.svg (Python Software Foundation trademark).

Verification: TypeScript and teacher production build passed during implementation. See LESSON-STUDIO-VALIDATION.md for final results. Browser CLI and alternative browser controller were blocked by Windows sandbox IPC/kernel initialization errors; no pixel-match assertion should be made without a later visual review. Existing live AI INVALID_AI_RESPONSE blocker is outside this visual redesign and is not claimed fixed.
