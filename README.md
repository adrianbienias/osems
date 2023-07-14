# OSEMS

Open Source Email Marketing Software

[🗒️ Check documentation »](https://osems.dev)

## TODOs

Tasks marked as done are removed from the list.

- [ ] feat: Add preheader text to newsletters/autoresponders table view
- [ ] feat: Add option to delete autoresponder (along with log), prompt to confirm
- [ ] feat: Add ability to cancel scheduled newsletter, prompt to confirm
- [ ] feat: Provide an option to send a test email for newsletter/autoresponder
- [ ] feat: Show autoresponder logs in dashboard
- [ ] feat: Handle SIGNUP_FORM_ACTION separately, without setting it as fixed option per OSEMS instance
- [ ] build: Dockerize the app
- [ ] docs: Record demo video showing how OSEMS works and how to use it (in Polish and English language)
- [ ] feat: Handle private API endpoints with API token
- [ ] refactor: Separate template schema for list, newsletter, and autoresponder and add relations
- [ ] refactor: Use a wrapper for SWR
- [ ] test: Add missing tests
- [ ] feat: Handle resubscribing (signup again after unsubscribing)
  - Place resubscribe button on the unsubscribe page
- [ ] feat: Add results pagination
- [ ] refactor: Distill routes in modules to distinct files
- [ ] test: Measure performance depending on the dataset size

## Coding guidelines

- Get ready for changes (e.g. swapping Prisma to TypeORM, React to Svelte)
  - Make the code agnostic, use adapters for external libraries
- Separate domain logic code
  - Prevent leaking libraries into domain logic
- Provide a single point of communication with modules
  - Export clear API methods (I/O)
  - Treat the communication similarly to a government bureaucracy
    - Provide forms for applicants and validate those forms (within API methods)
