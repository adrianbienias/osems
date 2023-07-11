# OSEMS

Open Source Email Marketing Software

[🗒️ Check documentation »](https://osems.dev)

## TODOs

Tasks marked as done are removed from the list.

- [ ] Dockerize the app
- [ ] Record demo video showing how OSEMS works and how to use it (in Polish and English language)
- [ ] Handle private API endpoints with API token
- [ ] Separate template schema for list, newsletter, and autoresponder and add relations
- [ ] Use a wrapper for SWR
- [ ] Add missing tests
- [ ] Handle resubscribing (signup again after unsubscribing)
  - Place resubscribe button on the unsubscribe page
- [ ] Add results pagination
- [ ] Distill routes in modules to distinct files
- [ ] Measure performance depending on the dataset size

## Coding guidelines

- Get ready for changes (e.g. swapping Prisma to TypeORM, React to Svelte)
  - Make the code agnostic, use adapters for external libraries
- Separate domain logic code
  - Prevent leaking libraries into domain logic
- Provide a single point of communication with modules
  - Export clear API methods (I/O)
  - Treat the communication similarly to a government bureaucracy
    - Provide forms for applicants and validate those forms (within API methods)
