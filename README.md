# Matvii Yermakov Testing Assessment to Elementor

This repository contains a WordPress setup with a custom child theme:

- Theme path: `wp-content/themes/hello-elementor-child`
- Admin app entry: `src/admin.tsx`
- Built assets output: `assets/admin.js` and `assets/admin.css`
- PHP unit tests path: `wp-content/themes/hello-elementor-child/tests`

## Prerequisites

- PHP (8.2+ for the theme, 8.3+ if you use PHPUnit 12)
- Node.js (v.23+) + npm
- PHPUnit installed globally in your environment
- WordPress running locally

## Build the Theme

From the project root:

```bash
cd wp-content/themes/hello-elementor-child
npm install
npm run build
```

Useful additional commands:

```bash
# Start Vite dev server
npm run dev

# Lint TypeScript/TSX files
npm run lint
```

## PHPUnit Unit Tests (Global `phpunit`)

Tests in this theme are unit tests with mocked WordPress functions (no DB bootstrap required).

Run tests from the theme directory:

```bash
cd /Users/matthew/Local\ Sites/elementor-testing-assessment/app/public/wp-content/themes/hello-elementor-child

# Standard run
phpunit -c phpunit.xml.dist

# Human-friendly detailed output
phpunit --testdox -c phpunit.xml.dist
```

## Test Files Overview

- `tests/bootstrap.php` - mocked WP test bootstrap for unit tests
- `tests/ProductPostTypeRegistrationTest.php`
- `tests/ProductMetaRegistrationTest.php`
- `tests/ProductRestFieldCallbacksTest.php`
- `tests/ProductTaxonomyRegistrationTest.php`
- `tests/UserProvisioningTest.php`
