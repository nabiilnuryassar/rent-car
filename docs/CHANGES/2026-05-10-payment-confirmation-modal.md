# Payment Receipt Confirmation Modal

Date: 2026-05-10  
Area: frontend, customer  
Type: feat

## Context

Users occasionally upload the wrong file when submitting payment receipts. To prevent verification delays and improve user experience, a confirmation step with a preview was requested.

## What changed

- **`resources/js/pages/customer/orders/show.tsx`**:
    - Integrated the `Modal` component from the UI library.
    - Added `useState` and `useEffect` to manage file selection, image preview (using `URL.createObjectURL`), and modal visibility.
    - Replaced direct upload logic with a two-step process:
        1. **Select**: User picks a file, triggering a confirmation modal.
        2. **Confirm**: User reviews the preview/file info and clicks "Konfirmasi & Upload".
    - Added a loading state (`isUploading`) with a spinner on the confirmation button.
    - Implemented image preview for image files and a generic file icon for PDFs/other formats.
    - Automatically resets the file input after selection to allow re-selecting the same file if cancelled.

## Impact

- **Reduced Errors**: Users can now visually verify their receipt before it's sent to the server.
- **Improved UX**: Loading states provide clear feedback during the upload process.
- **Consistency**: Uses the standard design system `Modal` and `lucide-react` icons.

## How to test

1. Go to an order detail page with "Pending Payment" status.
2. Click "Upload Bukti Transfer".
3. Select an image file -> Modal should open with an image preview.
4. Select a PDF file -> Modal should open showing the filename and type icon.
5. Click "Batal" -> Modal closes, no upload occurs.
6. Select a file again and click "Konfirmasi & Upload" -> Button shows loading spinner, and the page reloads upon success.

## Rollback plan

- Revert the changes in `resources/js/pages/customer/orders/show.tsx`.
