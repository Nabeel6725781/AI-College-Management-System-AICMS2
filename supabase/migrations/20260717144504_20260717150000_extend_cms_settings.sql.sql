/*
# Dynamic Website Settings — Extended cms_settings

## Summary
Adds new columns to the existing `cms_settings` table to support:
- Favicon URL (browser tab icon)
- Website URL (official website link)
- Principal information (name, email, phone, message)
- Registrar information (name, email, phone, office)
- Bank details (account name, account number, bank name, branch, IFSC/SWIFT code)
- Theme settings (primary color, accent color) for dynamic theming across the entire system

## Modified Tables
- **cms_settings** — adds the following nullable text columns:
  - `favicon_url` — URL to favicon image
  - `website_url` — official website URL
  - `principal_name` — name of the principal/head of institution
  - `principal_email` — principal's contact email
  - `principal_phone` — principal's contact phone
  - `principal_message` — a welcome message from the principal
  - `registrar_name` — registrar's name
  - `registrar_email` — registrar's email
  - `registrar_phone` — registrar's phone
  - `registrar_office` — registrar's office location/hours
  - `bank_account_name` — bank account holder name
  - `bank_account_number` — bank account number
  - `bank_name` — bank name
  - `bank_branch` — bank branch
  - `bank_ifsc` — IFSC/SWIFT/IBAN code
  - `theme_primary` — primary theme color (hex, e.g. #0f1118)
  - `theme_accent` — accent theme color (hex, e.g. #c69035)

## Security
- No new tables; existing RLS policies on cms_settings remain in effect.
- No data loss — all new columns are nullable additions.

## Idempotency
Uses `ADD COLUMN IF NOT EXISTS` for every column, so re-running is safe.
*/

ALTER TABLE cms_settings
  ADD COLUMN IF NOT EXISTS favicon_url text,
  ADD COLUMN IF NOT EXISTS website_url text,
  ADD COLUMN IF NOT EXISTS principal_name text,
  ADD COLUMN IF NOT EXISTS principal_email text,
  ADD COLUMN IF NOT EXISTS principal_phone text,
  ADD COLUMN IF NOT EXISTS principal_message text,
  ADD COLUMN IF NOT EXISTS registrar_name text,
  ADD COLUMN IF NOT EXISTS registrar_email text,
  ADD COLUMN IF NOT EXISTS registrar_phone text,
  ADD COLUMN IF NOT EXISTS registrar_office text,
  ADD COLUMN IF NOT EXISTS bank_account_name text,
  ADD COLUMN IF NOT EXISTS bank_account_number text,
  ADD COLUMN IF NOT EXISTS bank_name text,
  ADD COLUMN IF NOT EXISTS bank_branch text,
  ADD COLUMN IF NOT EXISTS bank_ifsc text,
  ADD COLUMN IF NOT EXISTS theme_primary text,
  ADD COLUMN IF NOT EXISTS theme_accent text;

-- Seed default theme values if null
UPDATE cms_settings
  SET theme_primary = COALESCE(theme_primary, '#0f1118'),
      theme_accent = COALESCE(theme_accent, '#c69035')
  WHERE theme_primary IS NULL OR theme_accent IS NULL;
