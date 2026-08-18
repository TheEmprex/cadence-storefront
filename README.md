# Cadence — storefront

A real multi-page static store. No build step, no dependencies, no framework.

## Run it

```bash
cd /Users/Maxou/Supplements/store
python3 -m http.server 8912
# → http://localhost:8912
```

You can also double-click `index.html` and browse from `file://`. Everything works
except the cart persisting between pages — Safari blocks `localStorage` on
`file://`, and the cart falls back to in-memory (it empties on navigation). Serve
it over HTTP for the full behaviour.

## Structure

```
index.html                 home
quiz.html                  the six-question quiz
shop.html                  collection, with working filters + sort
cart.html                  full cart page
checkout.html              three-step checkout mockup (takes no payment)
products/*.html            5 product detail pages
kits/*.html                2 kit pages
pages/*.html               how-it-works, standards, test-results, about, faq,
                           shipping-returns, contact
journal/*.html             index + 2 long-form articles

assets/css/store.css       the whole design system
assets/js/store.js         catalogue, cart, header/footer/drawer, packaging SVGs
assets/js/content.js       long-form product copy (data only)
assets/js/pages.js         renderers: PDP, kit, shop, cart, checkout
assets/js/quiz.js          the quiz
```

## How pages work

Product, kit, shop, cart and checkout pages are **data-driven**. The HTML file is a
shell; the content comes from `store.js` (catalogue) and `content.js` (copy), and is
rendered by `pages.js`:

```html
<main id="main" data-page="pdp" data-id="build"></main>
```

Change a price in one place (`store.js` → `CATALOG`) and it updates on every page,
including the kit value-comparison tables, which are computed rather than typed.

Content pages (`pages/`, `journal/`) are plain HTML — they are prose, not products.

## Adding a page

```html
<script>window.CADENCE_ROOT="../";</script>   <!-- "./" at site root -->
<link rel="stylesheet" href="../assets/css/store.css">
<script src="../assets/js/store.js" defer></script>
<script src="../assets/js/content.js" defer></script>
<script src="../assets/js/pages.js" defer></script>
...
<div id="site-header"></div>
<main id="main" data-page="content"> … </main>
<div id="site-footer"></div>
```

`CADENCE_ROOT` is what makes links resolve from any directory depth. The header,
footer and cart drawer inject themselves.

Add-to-cart buttons just need the data attributes:

```html
<button data-add="Build" data-id="build" data-meta="30 servings"
        data-color="var(--build)" data-url="products/build.html"
        data-sub-price="29" data-once-price="34">Add to cart</button>
```

## Checks

```bash
node check.js      # links, CADENCE_ROOT depth, duplicate ids, external
                        # resources, catalogue prices, kit-vs-parts pricing,
                        # and a compliance word scan
```

Two known false positives: the word "cure" appears in the mandatory DSHEA
disclaimer and in `standards.html` explaining the rule. Both are correct.

## Before this goes live

- **Reviews are placeholders.** Every review block is visibly labelled and must be
  replaced with the Judge.me widget. Do not ship invented testimonials.
- **Test results are sample data.** `pages/test-results.html` uses synthetic lot
  codes, clearly marked. Replace with real certificates from the contract lab.
- **Contact details are placeholders** — email, postal address. A real postal
  address on commercial email is required under CAN-SPAM.
- **Checkout is inert by design.** No card fields are rendered at all. On the real
  store this block is replaced by Shopify Checkout so card data never touches the
  page.
- **Trademark screen "Cadence"** (USPTO class 5) before buying the domain or
  committing to packaging artwork.

## Compliance rules baked into the copy

Naming a symptom is fine. Naming the medical condition is a drug claim.

Never: PMS relief, treats PMS/PMDD, relieves cramps, period pain, prevents UTIs,
treats BV or thrush, balances hormones, treats insomnia, detox, flushes toxins,
any weight-loss or body-composition framing.

Also: the site may say Cadence is *made without melatonin*. It may never say
melatonin is unsafe — that is an unsubstantiated claim about someone else's
product.
