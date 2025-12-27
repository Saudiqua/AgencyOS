# AgencyOS Signals Design Guidelines

## Design Approach
**Selected Framework:** Design System Approach - Carbon Design System  
**Rationale:** Professional B2B diagnostic tool requiring trust, clarity, and information hierarchy over visual flair. Carbon's enterprise-focused patterns align with the product's consultant-like positioning.

**Core Design Principles:**
- Professional restraint over visual excitement
- Clarity and explainability in every element
- Build trust through calm, confident design
- Feel like a diagnostic instrument, not consumer software

---

## Typography

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Inter (400, 500, 600)
- Monospace: JetBrains Mono (for data inputs/outputs)

**Hierarchy:**
- Page Titles: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Subsection Headers: text-lg font-medium (18px)
- Body Text: text-base (16px)
- Supporting Text: text-sm text-gray-600 (14px)
- Data Labels: text-sm font-medium uppercase tracking-wide

---

## Layout System

**Spacing Units:** Tailwind 4, 6, 8, 12, 16 units
- Component padding: p-6 or p-8
- Section margins: mb-8 or mb-12
- Form field spacing: space-y-6
- Tight groupings: space-y-4

**Container Strategy:**
- Max width: max-w-4xl (forms and reports)
- Page container: max-w-6xl mx-auto px-6
- Form sections: Contained, single-column for focus
- Report output: Wider for readability (max-w-5xl)

---

## Component Library

**Forms & Inputs:**
- Text inputs: Clean borders, subtle focus states, left-aligned labels above fields
- Number inputs: Monospace font for data entry
- Textareas: Larger for descriptive inputs, 4-6 rows default
- Select dropdowns: Native styling with subtle custom treatment
- Field groups: Related inputs grouped with subtle background (bg-gray-50) and p-6
- Validation: Inline, calm error messages below fields (text-sm text-red-600)

**Buttons:**
- Primary: Solid, prominent for main actions (Submit, Generate Report)
- Secondary: Outlined for alternative actions
- Text buttons: For tertiary actions (Cancel, Back)
- Sizing: px-6 py-3 for primary actions

**Cards & Containers:**
- Signal result cards: Border, subtle shadow, p-6 or p-8
- Section containers: bg-white border rounded-lg
- Dividers: Use sparingly, border-gray-200

**Report Display:**
- Markdown-style formatting in browser preview
- Monospace for data snippets within prose
- Clear visual hierarchy for signal findings
- Diagnostic sections clearly separated with headers

**Navigation:**
- Simple horizontal navigation if multi-page (Account Input → Review → Report)
- Breadcrumbs for context
- No complex menus - this is a focused tool

**Icons:**
- Font Awesome (via CDN) for interface elements
- Minimal usage: form validation, navigation, status indicators
- No decorative icons - only functional

---

## Page Structures

**Input Form Page:**
- Centered, single-column layout (max-w-4xl)
- Progress indicator at top (Step 1 of 2)
- Grouped field sections with headers and descriptions
- Sticky footer with navigation buttons
- Helper text explaining each signal's inputs

**Report Output Page:**
- Two-column option: Left = report preview, Right = actions (Download PDF, New Analysis)
- Full-width report display with print-friendly styling
- Export actions clearly visible but non-intrusive

**Landing/Home (if needed):**
- Minimal hero: Product name, one-line value prop, Start Analysis CTA
- Brief "How it works" (3 steps)
- No imagery needed - this is a tool, not a marketing site

---

## Images

**Approach:** No hero images or decorative imagery
**Rationale:** This is a diagnostic instrument for professionals. Clean, data-focused interface builds more trust than visual decoration. If branding is needed, use subtle logo placement only.

---

## Interaction Patterns

**State Management:**
- Loading states: Simple spinner with explanatory text ("Analyzing signals...")
- Success confirmations: Calm green checkmark, brief message
- Error handling: Clear, actionable error messages without alarm

**Animations:** None. This is a professional diagnostic tool requiring stability and trust.

---

## Accessibility
- WCAG AA compliant contrast ratios
- Keyboard navigation for all interactive elements
- Clear focus indicators (ring-2 ring-offset-2)
- Semantic HTML structure for reports
- Form labels properly associated with inputs

---

## Key Design Differentiators
- Feels like enterprise software, not a SaaS product
- Information architecture optimized for weekly/monthly usage patterns
- No gamification, no excitement - only professional clarity
- Output styled like a consultant's memo, not a software report