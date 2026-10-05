# GUTTER GHOSTS Operations Hub

Static GitHub Pages interface with shared content stored in the existing Portal Supabase project. The black/pink design, existing 60 message templates, nine links, seven call steps, window calculators, and collage tool are retained.

## Activation

1. In the existing Portal project's Supabase/Lovable database SQL editor, run `supabase/20261005_operations_hub.sql`. It creates only the new `gg_hub_state` table, a version-checked save function, and the `gg-hub-files` bucket. It does not change lead or payroll data.
2. `assets/config.js` uses the same browser-safe project URL and anonymous/publishable key as the Portal. Never put a service-role key, secret key, or database password in this file.
3. Preview the branch. Once the database setup succeeds, the toolbar says **Shared content connected**. The first saved change copies the bundled seed content into the new table. Subsequent loads use that shared record.
4. Verify a save in one browser appears in another (refresh immediately or wait up to 10 seconds). Verify PDF upload, replacement, attachment links, and deletion using temporary test content.
5. Merge the reviewed branch to publish through the repository's existing GitHub Pages deployment.

Without the database migration, reference content and calculators remain readable/usable, but shared editing is disabled. A failed save is never reported as successful, and there is no localStorage fallback masquerading as shared storage.

## Everyday editing

- Homepage: Add card; edit title/subtitle/destination; reorder with arrows; remove cards. Leave a new card's link blank to create an editable resource board.
- Communications and Holiday Lighting: add/edit/delete tabs and entries; reorder; search; copy messages and links. A holiday entry is the same database item in both views.
- Files: add PDFs, images, TXT, CSV, DOCX or XLSX (20 MB maximum). Edit an entry to upload its replacement. Link templates to existing file entries using the attachment checkboxes; replacement automatically changes their destination. This is file replacement and metadata editing, not a PDF page editor.
- Field Tools: edit/reorder/delete tabs; add custom resource tabs; edit the shared downspout material catalog. Per-job footage and counts remain independent on each user's device.
- Picasso: Before, After, Service Results; add/edit/remove/reorder heading choices and colours. The selected heading is rendered into the top of the exported image.
- Mock-ups: editable prompt builder, clipboard, and an Open ChatGPT button. Images are attached in ChatGPT; no embedded AI API or API billing is added.

Anyone with the hub link can view/edit/delete shared hub content, as requested. This is public anonymous access, not authentication. The schema limits its policies to the new hub table and file bucket; it does not broaden access to Portal or Dough Deck records. Deleted entries have no trash/restore flow. A confirmation prevents accidental clicks. Concurrent saves use a revision check; a stale draft stays open and requires an explicit retry after the latest content is loaded.

## Guard calculator

Use **linear feet**, not square feet.

- Sections = ceiling(footage / section length), default section length 7.4 ft.
- Section cost starts blank. Missing cost or return prevents a quote.
- Material subtotal = whole sections × section cost + selected downspout materials.
- Materials HST = 13% of material subtotal, rounded to cents.
- Quote subtotal = tax-inclusive material total + footage × selected return per foot.
- Client HST = 13% of quote subtotal, rounded to cents.
- Final quote = quote subtotal + client HST.

Example: 180 ft, 7.4 ft sections, **illustrative** $20 section cost, $10/ft target → 25 sections, $565 materials including HST, $2,365 quote subtotal, $307.45 client HST, $2,672.45 total. The retained amount after materials is $1,800. This is before labour/overhead and is not an accounting net-profit calculation. The tax-inclusive material-cost basis is the owner's requested pricing method.

Downspouts only receive a material subtotal/tax/total breakdown. Holiday Lighting offers a simple editable selling rate per linear foot plus extra display charges and client HST. All official quotes remain in Jobber.

Rate reference: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-place-supply.html
Supabase API/storage references: https://supabase.com/docs/guides/getting-started/api-keys and https://supabase.com/docs/guides/storage/security/access-control

## Validation

- `node tests/calculations.cjs` — mathematical checks, rounding, invalid input, whole sections, and adjustable per-foot return.
- `node tests/browser.cjs` — requires Playwright and a Chromium installation. Uses an in-memory mocked Supabase transport, never production writes. Checks editing, shared views, copy, safe text rendering, failed saves, concurrent save conflicts, upload, calculators, Maps URL, Service Results canvas text, and mobile overflow. Set `GG_CHROMIUM_PATH` and `GG_CHROMIUM_LIBS` if using a custom browser executable.
- `node tests/database.cjs` — requires `@electric-sql/pglite`; validates the schema, RPC revision checks, and anonymous access boundaries in a disposable local database.

The local browser tests do not prove the live Supabase migration or live Storage configuration has been applied. Activation requires the real two-browser/upload smoke check in step 4.

## Next phase: Portal and Dough Deck

These live in `chapwrld/ghost-intake-portal`, not this repository. Homepage links are retained. Requested subsequent work: editable intake/form configuration; simplify Dough Deck formatting, remove the payment sequence timer, and align job completion with payment amounts/dates, with shared edit/delete controls. Preserve existing payroll records and access controls during that separate change.

The supplied booklets were described as outdated, so they have not been republished as current approved files. The existing Drive folder link remains available. Upload the approved replacements through the new file controls after activation.
