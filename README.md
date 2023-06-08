# Open Source Email Marketing Software (OSEMS)

## Motivation

Hi!

I'm Adrian Bienias. A developer behind this software.

During my career, I was using a lot of different email marketing solutions.

None of them suited my needs in terms of fair pricing.

Monthly billings by the size of the list sounded unfair to me (storing emails in databases isn't that expensive).

Plans that billed for emails sent, were also overpriced.

That's why I brought this software to life.

By using it you can create lists, embed customized signup forms on your websites, and send newsletters to your subscribers

And that's for as low as $0.10 per 1000 sent email.

Besides that, storing millions of emails in your lists (5 GB database) costs you totally nothing.

The only fixed cost is a server that you need to use in order to have this app up and running (around $5/month).

More details later on this page.

If you find that something doesn't work in this software properly - just [report a bug](https://github.com/adrianbienias/osems/issues).

The same goes with features. If you think that something is missing, feel free to [submit a feature request](https://github.com/adrianbienias/osems/issues).

## Pricing comparison (10 000 contacts example)

| Email service          | Monthly send limit | Monthly cost                           |
| ---------------------- | ------------------ | -------------------------------------- |
| Mailchimp              | 100 000            | $100                                   |
| AWeber                 | Unlimited          | $79.99                                 |
| GetResponse            | Unlimited          | $79                                    |
| **OSEMS** + Amazon SES | Unlimited          | $5 + $1 per 10 000 emails sent via SES |

OSEMS is free of charge. $5 is the cost of hosting the app on [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform?refcode=80e257abf861) (by using this link you even get 60 days for free).

## Quick test drive

To quickly test OSEMS, just clone the repo and test it in your dev environment.

1. Rename `.env.example` to `.env`
2. Generate SMTP credentials for testing purpose at https://ethereal.email/create
3. Set those credentials in `.env` file in `EMAIL_SERVER_*` variables
4. Run `npm install` and `npm run dev`
5. Open http://localhost:3000/lists/add and add a new list (you can leave form defaults)
6. Scroll down to _Unstyled preview_ of signup form and use it to add a new contact to your list
7. Check out Ethereal inbox at https://ethereal.email/messages where confirmation email should appear
8. Click the link in confirmation email to confirm the signup to the list
9. Create a new newsletter at http://localhost:3000/newsletters/add
   - Choose _List to send to_
   - Schedule (send) the newsletter
10. Again, check out Ethereal inbox at https://ethereal.email/messages where sent newsletter message should appear

**That's all. You made it!** 🎉

Click the start on GitHub repo to show your awesomeness. 🤩

## Technical details

OSEMS is build on top of [Next.js](https://nextjs.org/) framework.

It uses [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), and [Node.js](https://nodejs.dev/en/).

For database operations it uses [Prisma](https://www.prisma.io/), that allows you to connect without any hassle with:

- PostgreSQL
- MySQL
- SQLite
- MongoDB
- CockroachDB
- Microsoft SQL Server

For visual styling, [Tailwind CSS](https://tailwindcss.com/).

Automated tests have been written in [Vitest](https://vitest.dev/) (as a more performant alternative to [Jest](https://jestjs.io/)).

Cron jobs are handled via [node-cron](https://github.com/node-cron/node-cron).

On the frontend side, data is fetch by [SWR](https://swr.vercel.app/).

Emails are sent with [Nodemailer](https://nodemailer.com/about/).

## Going to production

First of all, set `APP_ENV=production` in `.env` file.

In development environment, authorization to access dashboard panel is turned off.

In production environment it's automatically activated.

You can also turn it on for development by editing `src/middleware.ts` (more info in that file).

Set `INITIAL_ADMIN_EMAIL` in `.env` file. That email is used to authorize access to the dashboard.

Also, you need to set `EMAIL_SERVER_*` variables in `.env`, providing credentials of SMTP server, that you're going to use to handle sending of your emails.

## Choosing SMTP server

OSEMS works as BYO SMTP service. BYO stands for _Bring Your Own_.

You use SMTP server of your choice in order to send newsletters via _OSEMS_.

The king here is [Amazon SES](https://aws.amazon.com/ses/), which allows you to send emails for a flat price $0.10 per 1000 emails.

Amazon SES allows you to use whatever domain you control as a sender of your emails.

Of course, you can use whatever SMTP server suits you, but from my research there's no better SMTP service in terms of price/reliability.

Have in mind that typical email services (like e.g. Gmail), have a quite low daily limit for outbound emails ([around 500](https://support.google.com/mail/answer/22839?hl=en#zippy=%2Cyou-have-reached-a-limit-for-sending-mail)) or if you're a [Google Workspace](https://support.google.com/a/answer/166852?hl=en#zippy=%2Cconvert-to-a-paid-account) user, that limit can go up to 2000 (for 24-hour period).

It can be sufficient in some cases, when you don't plan to send large newsletters.

In order to use Gmail SMTP, you may need to create App Password for your Google Mail to later use it as SMTP password when you're using 2-Step Verification for your Google account.

More info:

- [Send an email from your alias in Gmail - Google Domains Help](https://support.google.com/domains/answer/9437157?hl=en&ref_topic=6293345)
- [Send email from a printer, scanner, or app - Google Workspace Admin Help](https://support.google.com/a/answer/176600?hl=en#gmail-smpt-option)

Example Gmail SMTP settings:

```
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-name@gmail.com
EMAIL_SERVER_PASSWORD=google-generated-app-password
NEXT_PUBLIC_EMAIL_FROM=Your Name <your-name@gmail.com>
```

## Deployment infrastructure

You can deploy OSEMS on a regular VPS, but then you need to manage few server administration related things (e.g. hardening security) on your own. So that can be unnecessary overhead, especially for the beginning.

The other, and much simple choice, is to use a serverless hosting provider.

One of them, which I suggest to use, is [App Platform](https://www.digitalocean.com/products/app-platform?refcode=80e257abf861) from DigitalOcean.

Here's a [ref code](https://www.digitalocean.com/?refcode=80e257abf861) that you can use to get $200 coupon for their service, that you can spend within 60 days after signup.

By using App Platform you're getting out of the box a free subdomain for your app with SSL/TLS certificate, and easy to manage deployment process.

Aside from hosting the app, you also need a database.

My suggestion for a serverless database is [PlanetScale](https://planetscale.com/).

They offer a generous, free, hobby plan with 10 000 000 row writes per month.

That means you can get e.g. 1 000 000 list subscribers per month, and 9 000 000 sendings (each email send is logged in the database).

Also, you're getting a storage of 5 GB, that allows you to store millions of emails addresses for free!

The only downside is that if the database is completely inactive for 7 days, it enters [sleep mode](https://planetscale.com/docs/concepts/database-sleeping).

But that's not the case for OSEMS, since it has a running cron job that automatically check for scheduled newsletters, so it queries the database very often, preventing it from being idle.

## Managing database

What's not implemented (yet) in OSEMS dashboard panel, can be achieved by managing database directly.

OSEMS uses [Prisma](https://www.prisma.io/), which comes with a handy _Studio_, which is a simple yet powerful GUI database browser.

To run it, use the following command in terminal:

```
npx prisma studio
```

From there, you can do almost everything with your data like filtering, adding, editing, and removing.

If the infrastructure (e.g. App Platform) doesn't allow you to run Prisma Studio directly in the app console, you can still use it locally in you development environment, while setting `DATABASE_URL` to production database.

## Cron jobs

By scheduling a newsletter to be sent, a program (called cron), has to check periodically whether the date/time of the scheduled newsletter has passed.

Without that, newsletters aren't sent at all (even if they are scheduled to be sent immediately).

OSEMS provides built in Node.js cron jobs, so you don't need to worry about them.

But some serverless hosting providers (e.g. Vercel), won't allow you to run this kind of cron jobs.

It's worth noting that even if the app work well on a serverless DigitalOcean App Platform it can fail on other solutions like mentioned Vercel hosting.

Mostly because of the lack of handling cron jobs, or hard limit of function executions.

Newsletters sending can take sometimes even hours (for large lists).

## Changing signup form validation (optional)

By default, `SIGNUP_FORM_ACTION` in `.env` file is set to `redirect`.

That means, after submitting the signup form, there will be an automatic redirection to a standalone page, either the one defined by you as `Signup redirect URL` in the list settings, or if some errors occur, to an internal OSEMS error page, placed in `src/pages/public/signup-form-error.tsx`.

You can change this default behavior by switching setting `SIGNUP_FORM_ACTION` to `api`.

From that point, all signup form submits will receive a response from the API (in JSON format).

API mode is desired if you want to handle signup form submits on your own.

It's useful if you want to handle validation on the client side as well as redirect after successful submit programmatically.

## Generating visual dependency graph

It can be helpful from the architectural point of view to see how parts of the system depend on each other.

- [dependency-cruiser - npm](https://www.npmjs.com/package/dependency-cruiser)
- [Graphviz](https://graphviz.org/download/) (required by dependency-cruiser)

Example usage:

```
npx depcruise .  --ts-config --exclude "(node_modules|\.next|\.test)" --output-type dot | dot -T svg > dependency-graph.svg
```

## FAQ

### Does OSEMS handle plain text emails along with HTML?

Yes. Plain text versions are automatically generated based on HTML templates, using [node-html-to-text](https://github.com/html-to-text/node-html-to-text) library.

Even if sending plain text may sound optional, it's encouraged to send it along HTML in order to satisfy spam filters.

> "Spam filters like to see a plain text alternative. HTML-only emails are a red flag for spam filters."
>
> \- [Learn Why Plain Text Emails Still Work and How to Use Them - Litmus](https://www.litmus.com/blog/best-practices-for-plain-text-emails-a-look-at-why-theyre-important/)

## TODOs

- [ ] Add filtering newsletters by list name (similar to autoresponders)
- [ ] Provide more details in for sent newsletters (list name, excluded list names, scheduled date)
- [ ] Use list pickers for selecting lists on Newsletter creation page
- [ ] Add fully fledged documentation (using https://nextra.site/)
- [ ] Add instruction for using https://aws.amazon.com/ses/
- [ ] Create a landing page with waiting list for a video course about building this app
- [ ] Record demo video showing how OSEMS works and how to use it (in Polish and English language)
- [ ] Dockerize the app
- [ ] Handle resubscribing (signup again after unsubscribing)
  - Place resubscribe button on the unsubscribe page
- [ ] Add results pagination
- [ ] Add template relations in schema to newsletters and autoresponders
- [ ] Distill routes in modules to distinct files
- [ ] Measure performance depending on the dataset size
- [ ] Exclude contacts by existing autoresponder logs before iterating them (inline TODO)
- [ ] Create a landing page with waiting list for a cloud version of this app

## Coding guidelines

- Get ready for changes (e.g. swapping Prisma to TypeORM)
  - Make the code agnostic, use adapters for ORMs or any other libraries
- Separate domain logic code from other libraries
  - Prevent leaking external libraries into domain logic
- Provide a single point of communication with modules
  - Export clear API methods (I/O)
    - Document those API methods (what they expect to receive, what they return)
  - Treat the communication similarly to a government bureaucracy
    - Provide forms for applicants and validate those forms (within API methods)
