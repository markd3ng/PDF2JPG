# site-verification Specification

## Purpose
TBD - created by archiving change site-verification. Update Purpose after archive.
## Requirements
### Requirement: Search engine site verification via meta tags

The system SHALL support site ownership verification for Google, Bing, Yandex, and Baidu search engines by injecting HTML `<meta>` tags into the page `<head>` at build time.

Each verification code SHALL be configured via a corresponding environment variable with the `PUBLIC_` prefix. When an environment variable is set to a non-empty value, the corresponding `<meta>` tag SHALL be rendered. When the variable is unset or empty, no `<meta>` tag SHALL be rendered for that platform.

#### Scenario: Google verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_GOOGLE_SITE_VERIFICATION` is set to `abc123` during build
- **THEN** the page `<head>` SHALL contain `<meta name="google-site-verification" content="abc123">`

#### Scenario: Google verification meta tag is omitted when env is not set

- **WHEN** `PUBLIC_GOOGLE_SITE_VERIFICATION` is not set or is empty during build
- **THEN** the page `<head>` SHALL NOT contain a `google-site-verification` meta tag

#### Scenario: Bing verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_BING_SITE_VERIFICATION` is set to `def456` during build
- **THEN** the page `<head>` SHALL contain `<meta name="msvalidate.01" content="def456">`

#### Scenario: Yandex verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_YANDEX_SITE_VERIFICATION` is set to `ghi789` during build
- **THEN** the page `<head>` SHALL contain `<meta name="yandex-verification" content="ghi789">`

#### Scenario: Baidu verification meta tag is injected when env is set

- **WHEN** the environment variable `PUBLIC_BAIDU_SITE_VERIFICATION` is set to `jkl012` during build
- **THEN** the page `<head>` SHALL contain `<meta name="baidu-site-verification" content="jkl012">`

#### Scenario: All four verification meta tags are injected simultaneously

- **WHEN** all four `PUBLIC_*_SITE_VERIFICATION` environment variables are set to non-empty values during build
- **THEN** the page `<head>` SHALL contain all four corresponding `<meta>` tags

#### Scenario: Verification meta tags are visible in development mode

- **WHEN** `npm run dev` is running and a `.env` file with `PUBLIC_GOOGLE_SITE_VERIFICATION=abc123` exists
- **THEN** the page `<head>` SHALL contain `<meta name="google-site-verification" content="abc123">`

### Requirement: Environment variable type declarations

The system SHALL provide TypeScript type declarations for all site verification environment variables in `src/env.d.ts`, ensuring type-safe access via `import.meta.env`.

#### Scenario: Type declarations exist for all four env vars

- **WHEN** `src/env.d.ts` is inspected
- **THEN** it SHALL contain `ImportMetaEnv` interface augmentations for `PUBLIC_GOOGLE_SITE_VERIFICATION`, `PUBLIC_BING_SITE_VERIFICATION`, `PUBLIC_YANDEX_SITE_VERIFICATION`, and `PUBLIC_BAIDU_SITE_VERIFICATION`, each typed as `string | undefined`

