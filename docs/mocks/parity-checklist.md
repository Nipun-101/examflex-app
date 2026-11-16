# Parity checklist (vs ezprep-app)

## Listing / hub

- [x] Categories with exams + `testsCount`
- [x] Empty and error states
- [x] Exam intro: header, description, structure
- [x] Tabs: Overview · Chapter Wise · Full Mocks · Sprint Tests
- [x] Paginated paper lists
- [x] START / RETAKE / RESUME actions
- [x] Concurrent launch lock
- [x] Locked badge + View plans; RESUME never blocked
- [x] Start `ENTITLEMENT_REQUIRED` handling

## Attempt runner

- [x] Sticky header (title, index, zoom, timer, EN/ML)
- [x] Desktop palette + mobile sheet/bottom bar
- [x] Zoom on question+options only
- [x] Optimistic answer PATCH; clear on re-tap; mark-for-review
- [x] Server timer; pause; warnings; time-up
- [x] Session-wise `sessions/complete`
- [x] Back-button exit trap
- [x] beforeunload + keepalive pause
- [x] sessionStorage attempt cache
- [x] Mathpix rendering
- [x] Submit confirm + blocking overlay; disarm guards after success

## Results

- [x] Score summary + answer key + explanations
- [x] Redirect if already SUBMITTED/EXPIRED when opening attempt
