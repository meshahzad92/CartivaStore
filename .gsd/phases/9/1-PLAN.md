---
phase: 9
plan: 1
wave: 1
---

# Plan 9.1: Implement PostEx Item Details Modal

## Objective
Enhance the PostEx Orders page by adding an intuitive, centered modal that allows the admin to view and edit all PostEx upload parameters (including weight, pickup code, and store code) before committing the upload.

## Context
- .gsd/SPEC.md
- frontend/src/pages/admin/AdminPostex.jsx
- backend/app/api/routes/postex.py
- backend/app/services/postex.py

## Tasks

<task type="auto">
  <name>Create Item Details Modal UI</name>
  <files>frontend/src/pages/admin/AdminPostex.jsx</files>
  <action>
    - Add a new "Details/Expand" icon button next to the "Items (qty)" cell in the orders table.
    - Create a centered Modal component (darkened background overlay, white center card) to display when the icon is clicked.
    - The modal should map all fields from the selected order's `edits` state object to form inputs.
    - Ensure fields included are: Order Ref Number, Customer Name, Customer Phone, Delivery Address, City, Items Quantity, Invoice Payment, Order Detail/Notes.
    - Also add new editable fields that weren't in the table but are sent to PostEx: `weight` (defaults to settings), `pickupAddressCode` (defaults to settings), `storeAddressCode` (defaults to settings).
    - Add Save & Close buttons inside the modal. Save updates the row's `edits` state.
  </action>
  <verify>npm run dev -- prefix and navigate to admin postex page to see if modal opens properly</verify>
  <done>Clicking the details icon opens a centered modal with all PostEx fields editable, and saving it updates the local state.</done>
</task>

<task type="auto">
  <name>Integrate Modal Data with Backend Payload</name>
  <files>
    frontend/src/pages/admin/AdminPostex.jsx
    backend/app/api/routes/postex.py
  </files>
  <action>
    - Update the `handleUpload` payload in `AdminPostex.jsx` so it gathers the new optional fields (weight, pickup_address_code, store_address_code) from the `edits` object and sends them in the `overrides`.
    - Modify the `upload_to_postex` route in the backend to explicitly prefer the `weight`, `pickupAddressCode`, and `storeAddressCode` strings off the `ov` (override) dictionary before falling back to the settings defaults.
    - Pass this custom weight down to the `create_postex_order` service call payload.
  </action>
  <verify>python -m py_compile backend/app/api/routes/postex.py</verify>
  <done>Frontend override fields transparently override database defaults during PostEx upload for that specific order.</done>
</task>

## Success Criteria
- [ ] Admin can click an eye/settings icon next to an order.
- [ ] A clean, centered modal displays all required and optional PostEx fields.
- [ ] Admin can override the weight and address codes specifically for one order.
- [ ] Changes made inside the modal overwrite the payload sent to the API.
