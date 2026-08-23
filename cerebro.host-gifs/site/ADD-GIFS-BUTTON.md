# Adding the "Gifs" button to cerebro.host

Goal: a **Gifs** button directly above the existing **News** button in the hero.

## Why a wrapper is needed

The hero button lives in `.hero-inner`, which is `display: flex` with the default
`flex-direction: row` — News sits *beside* the hero text, not under it. Dropping a
second `<a>` next to it would put Gifs to the **left of** News on the same row, not
above it. So both anchors get wrapped in a column.

The button reuses the existing `.hero-articles-button` class, so it inherits the
green pill styling exactly. No new visual language, nothing to keep in sync.

## Step 1 — CSS

Add to the stylesheet block (next to the existing `.hero-articles-button` rule):

```css
.hero-cta-stack {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
}
```

## Step 2 — HTML

**Find** this in the hero (it currently sits right after the `.network-badges` div):

```html
<a href="https://cerebro.host/articles" class="hero-articles-button">
    <span>News</span>
    <span class="hero-articles-button-icon">→</span>
</a>
```

**Replace it with:**

```html
<div class="hero-cta-stack">
    <a href="https://gifs.cerebro.host" class="hero-articles-button">
        <span>Gifs</span>
        <span class="hero-articles-button-icon">→</span>
    </a>
    <a href="https://cerebro.host/articles" class="hero-articles-button">
        <span>News</span>
        <span class="hero-articles-button-icon">→</span>
    </a>
</div>
```

The News anchor is unchanged — it just moves inside the wrapper.

## Order matters

Do this **after** `gifs.cerebro.host` is deployed and returns 200. Shipping the button
first points the community at a dead link.

## Reference

Current markup lives in `cerebro.host-main/cerebro-preview-v2.html` (and the two
`cerebro-backup*-v2.html` files). The live site is edited in Sitejet, so those local
files are references, not the deploy target — paste the change into the Sitejet editor.
