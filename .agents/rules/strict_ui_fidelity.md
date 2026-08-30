# Strict UI Fidelity & UX Constraints

When building or translating UI from user sketches/wireframes:
1. **Strict Input Fidelity**: Do not add extra visual elements (like icons inside input fields) to make a design look "premium" unless the user's sketch explicitly includes them or they request it. Keep the structural simplicity of the original design.
2. **No Unprompted Auto-Redirects**: Do not implement automatic time-based redirects (e.g., `setTimeout` on a Splash screen) if there is an explicit CTA (Call to Action) button designed for that screen, as it breaks the intended user flow.
