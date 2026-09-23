# QCOM Development Rules & Constraints

1. **Strict Fidelity to User Intent & Scope**:
   - Build a production-grade operational Delivery Partner App for QCOM.
   - Do NOT add unsolicited visual gimmicks, games, or marketing noise.

2. **Preserve Ecosystem Compatibility**:
   - Use canonical QCOM order statuses (`placed`, `picking`, `packed`, `out_for_delivery`, `arriving`, `delivered`, `cancelled`).
   - Match exact financial structures (INR ₹ currency, base pay + per km distance pay + surge + tips).
   - Use masked customer phone proxy format (`+91 98XXX-XX891`).

3. **No Scattered Mock Data**:
   - All data models and initial seed datasets must originate from `/src/services/mockData.ts`.
   - UI components MUST interact solely through structured service interfaces (`deliveryTaskService`, `earningsService`, etc.).

4. **Operational UI Standards**:
   - Provide skeleton states for loading.
   - Provide clear empty and error retry states.
   - Mobile tap targets must be at least 48px.
   - Operational actions (Accept Task, Mark Picked Up, Verify OTP) must be prominent and unambiguous.

5. **Anti-Vibe-Coding Standards**:
   - No fake AI glowing dark mode.
   - No decorative bento boxes or rainbow gradients.
   - Design for real-world single-handed outdoor phone usage with high legibility.
