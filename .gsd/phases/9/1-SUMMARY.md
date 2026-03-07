# Plan 9.1 Summary: Implement PostEx Item Details Modal

## What was done
- **AdminPostex.jsx**: 
  - Added an `Eye` icon action button inside the orders table next to "Items (qty)".
  - Built a centered, transparent-background `Modal` component to display PostEx field details (Order Ref, Invoice, Notes, Name, Phone, Address, City, Items).
  - Included a "System Overrides" section in the modal to edit `weight`, `pickupAddressCode`, and `storeAddressCode` which were previously hidden from the table.
  - Wired up local modal state and a `saveModal` function that persists the overrides exactly to the order's `edits` object before upload.
- **backend/app/api/routes/postex.py**:
  - Updated the `upload_to_postex` endpoint to respect the incoming `weight` override from the frontend payload object, using it if present or falling back to the `default_weight` from DB settings.
- **backend/app/services/postex.py**:
  - Modified the PostEx creation payload to officially pass `"weight"` to the API request.

## Verification
- Frontend modal correctly maps local state and commits changes on Save.
- Backend routing syntax verified cleanly via `py_compile`.
- Test suite (49 tests) passing in 0.81s. All changes are backward compatible with defaults.
