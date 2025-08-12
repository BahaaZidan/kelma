# Kelma

An open-source comment section provider for publishers of all sizes. If you need a simple one-line setup, consider our hosted solution at https://kelma.dev/

## Selfhosting

### Prerequisites

- Cloudflare Worker (runtime)
- Cloudflare D1 (sql database)

While the project assumes the above infrastructure, with some coding experience you can fork it and swap the [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) to make it work with Node.js or any other environment. And because the project utilizes [Drizzle ORM](https://orm.drizzle.team/docs/get-started/d1-new), swapping SQLite drivers should be trivial.

### Steps

- Fork this repo.
- Modify the `wrangler.jsonc` file:
  - `d1_databases.database_name`: The D1 instance you created in your Cloudflare dashboard
  - `d1_databases.database_id`: The ID of said database
  - `routes.pattern`: The domain name you intend to use for this. If you don't want to use a custom domain, you can remove the entire `routes` entry in `wrangeler.jsonc`
  - `vars.PUBLIC_BASE_URL`: The base URL for your app. `https://gebna.gg` or `https://project.user.workers.dev`. _don't inlcude a trailing slash_
  - `vars.PUBLIC_GITHUB_CLIENT_ID`: The client ID for your github app. this is used to allow users to login via GitHub.
  - `vars.PUBLIC_STRIPE_KEY`: Feel free to remove this as it's meaningless if you're selfhosting. You can easily increase your balance via direct db updates.
- Create a worker project in Cloudflare.
- Connect it to your GitHub fork.
- Consult the `.env.example` file to determine the secret environment variables needed.
- Clone the repo, Locally create a `.env` file and populate it accordingly. This will come in handy when running db migrations
- Add the secrets required in your Cloudflare worker project settings.
- Run `pnpm db:migrate`. This will run the migrations against your production database.
- That should be it ✅
