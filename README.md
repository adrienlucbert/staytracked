# StayTracked

Self-hostable Garmin LiveTrack & Coros Safety Alerts session persister with built-in access management and notifications.

This project allows you to capture and persist Garmin LiveTrack and Coros Safety Alerts sessions (live GPS data shared from your Garmin or Coros device) and optionally send notifications (e.g., via email or browser push notifications) your followers when you start a new session.

See [how it works!](https://staytracked.app/#how-it-works)

> This service is in no way related to Garmin® or Coros but extends and simplifies the use of their tracking feature.

![website landing page](https://github.com/user-attachments/assets/0e67c613-d146-48d6-a590-7676430554da)

## Table of Contents

- [Preamble](#preamble)
- [Features](#features)
- [Self-hosting](#self-hosting)
  - [Run in production](#run-in-production)
    - [Expose via Traefik (recommended)](#expose-via-traefik-recommended)
    - [Expose on your host network](#expose-on-your-host-network)
  - [Run locally / for development](#run-locally--for-development)
  - [Feature flags](#feature-flags)
  - [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Preamble

This project is designed with open-source and self-hosting in mind, it's meant to be and remain free to use and easy to self-host. It is hosted and can be used for free at [staytracked.app](https://staytracked.app), as long as the SMTP server limit is not reached. If someday this limit is reached and I am forced to upgrade to a paid plan for sending emails, I might need to dedicate [staytracked.app](https://staytracked.app) to personal use. The project will still remain self-hostable of course.

## Features

- Captures Garmin LiveTrack or Coros Safety Alerts start events (by registering the app as an email recipient in the Garmin Connect™ or Coros app)
- Persists tracking sessions into a customizable but persistent URL
- Manage access to your tracking link:
  - Public: Anyone with the link can access the session
  - Restricted: Only people explicitly invited or allowed can access the session
- Followers can choose to get notified when you start a session
- Graph of visits history per user
- Account creation via email, Google or Github
- WebPush and email notifications with support for installing as a PWA

## Self-hosting

> If you're new to self-hosting, you should probably consider reading a guide such as [Self Hosting 101 - A Beginner's Guide](https://ente.io/blog/self-hosting-101/).

This project uses docker-compose to run its different parts:

- [smtp-proxy](/smtp-proxy): a [Salmon SMTP server](https://salmon-mail.readthedocs.io/en/latest/) used to capture Garmin/Coros-sent tracking session start emails and extract the session link in them
- postgres: the database used to run this app
- [ui](/ui): the web UI and API

For local/development environment only:

- [maildev](https://github.com/maildev/maildev): SMTP Server + Web Interface for viewing and testing emails during development

This project includes several `quickstart-*.yml` files meant to be combined to help you run the app, depending on your use-case and environment.

It also comes with a [justfile](https://github.com/casey/just) that you can use to run common commands.

To begin, clone the repository:

```bash
git clone https://github.com/adrienlucbert/staytracked.git
cd staytracked
```

### Run in production

Copy `./.env.example` to `./.env` and `./ui/.env.example` to `./ui/.env` and adjust variables.

Refer to [Environment variables](#environment-variables) for details.

#### Expose via Traefik (recommended)

[Traefik](https://traefik.io/traefik) is an open-source reverse proxy that you can use for free to expose your apps. `quickstart-traefik.yml` provides a very basic configuration to expose the app through [http://staytracked.localhost](http://staytracked.localhost).

```sh
just run
# or
docker compose -f quickstart.yml -f quickstart-traefik.yml up -d
```

> It is however recommended to use a [more advanced Traefik setup](https://doc.traefik.io/traefik/getting-started/quick-start/) with the [Docker provider enabled](https://doc.traefik.io/traefik/reference/install-configuration/providers/docker/), TLS setup etc...

#### Expose on your host network

To run the app and expose it on your host network, run the following:

```sh
just run-local
# or
docker compose -f quickstart.yml -f quickstart-local.yml up -d
```

You can now access it through port 3000 via [http://localhost:3000](http://localhost:3000) or [http://<YOUR_MACHINE_IP>:3000](http://<YOUR_MACHINE_IP>:3000).

### Run locally / for development

Copy `./.env.example` to `./.env` and `./ui/.env.example` to `./ui/.env.dev` and adjust variables.

Refer to [Environment variables](#environment-variables) for details.

If you want to run the project in development mode, you can run

```sh
just dev
# or
docker compose -f quickstart.yml -f quickstart-dev.yml -f quickstart-local.yml up -d
```

This comes with a [maildev](https://github.com/maildev/maildev) server accessible via [http://localhost:1080](http://localhost:1080) to capture and read emails sent by the app. It also runs the ui with hot-reload.

### Feature flags

The project is configurable via environment variables. Some of them enable or disable features. You can find them in [`./ui/.env.example`](./ui/.env.example).

Refer to [Environment variables](#environment-variables) for details.

### Environment Variables

Here is the list of environment variables you can use to configure the app:

#### Root configuration (`./.env.example`)

- **`POSTGRES_DB`** *(default: `staytracked`):* name of the postgres database to create and use
- **`POSTGRES_USER`** *(default: `postgres`):* name of the postgres user to use
- **`POSTGRES_PASSWORD`** *(default: `postgres`)*: password for the postgres user
- **`SMTP_PROXY_BASIC_AUTH`**: Basic Auth user and password to use between the SMTP proxy and the ui API.

> In production, the postgres database is not exposed, leaving the defaults is relatively safe. However, make sure to change the `SMTP_PROXY_BASIC_AUTH`.

#### UI Configuration (`./ui/.env.example`)

**General configuration**:

- **`APP_NAME`** *(default: `StayTracked`)*: name of the app you want to display in the UI and in the emails
- **`PUBLIC_URL`** *(default: <http://localhost:3000>)*: URL that can be used to access your app publicly
- **`ORIGIN`** *(default: equals to `PUBLIC_URL`)*: this must match `PUBLIC_URL`. It is used by [SvelteKit's Node adapter](https://svelte.dev/docs/kit/adapter-node) for CORS
- **`JWT_TOKEN_SECRET`**: a passphrase used to encode JWT. It can be anything, as long as it remains secret
- **`SMTP_CONNECTION_URI`**: smtp://localhost:1025)*: the connection URI to your SMTP server of choice. For local development, choose `smtp://maildev:1025`. For production, you might want to check something like [mailjet](https://www.mailjet.com/)
- **`SMTP_FROM`**: the email address you will be sending emails from
- **`PUBLIC_SMTP_PROXY_HOSTNAME`**: the hostname where your SMTP proxy (Salmon) will be listening. Likely your app's hostname if you're hosting them side-by-side.

> The following Vapid keys can be generated using `npx web-push generate-vapid-keys`

- **`VAPID_PUBLIC_KEY`**: the Vapid public key for web push notifications
- **`VAPID_PRIVATE_KEY`**: the Vapid private key for web push notifications

**Feature flags**:

- **`ENABLE_RECOVER_PASSWORD`** *(default: `true`)*: Enable the "Recover password" feature. If set to false, users will not be able to request a password reset.
- **`ENABLE_VERIFY_EMAIL`** *(default: `true`)*: Enable the "Verify email feature". If set to false, users won't need to verify their email to receive emails (password reset, notifications, ...).
- **`ENABLE_OAUTH_GITHUB`** *(default: `false`)*: Allow authenticating with Github
- **`ENABLE_OAUTH_GOOGLE`** *(default: `false`)*: Allow authenticating with Google
- **`ENABLE_VISITS_STATISTICS`** *(default: `true`)*: Allow recording and plotting visits statistics (this is only recorded on your self-hosted instance, its purely for the users to consult)

**OAuth providers**:

- **`GITHUB_CLIENT_ID`** & **`GITHUB_CLIENT_SECRET`**: [Github OAuth client ID & secret](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps) (required for the authentication with Github to work)
- **`GOOGLE_CLIENT_ID`** && **`GOOGLE_CLIENT_SECRET`**: [Github OAuth client ID & secret](https://developers.google.com/identity/protocols/oauth2) (required for the authentication with Google to work)

## Contributing

Contributions are welcome! Feel free to use the [Issues](https://github.com/adrienlucbert/staytracked/issues) section to report issues or bugs and suggest enhancements.

If you have the possibility, don't hesitate to submit [pull requests](https://github.com/adrienlucbert/staytracked/pulls) to help with the development. If your development concerns a new feature, consider submitting your idea via an issue for discussing it with me before spending time developing it. Or fork the project and make it your own!

## License

This project is licensed under the **Unlicense**. You can do whatever you want with it. See the [LICENSE](./LICENSE) for details.
