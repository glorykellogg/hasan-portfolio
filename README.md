# Hasan Portfolio

A Quarto website adapted from Glory Kellogg’s portfolio design.

## Edit and preview

Install Quarto from https://quarto.org/docs/get-started/.

Edit the eight `.qmd` pages. Shared styling is in `styles.css`; the Hasan wordmark and footer are in `header.html` and `footer.html`.

```sh
quarto preview
```

## Render

```sh
quarto render
```

The rendered website is saved in `docs/`. This package includes the previous static website in `docs/`, so it can be hosted immediately. The Quarto source was checked with Pandoc, but a full Quarto render could not complete in the restricted editing environment because its stylesheet cache was not writable. Run `quarto render` on your computer to replace `docs/` with Quarto-generated pages.

## GitHub Pages

1. Create a repository named `hasan-portfolio` under `glorykellogg`.
2. Upload this folder’s contents, keeping `docs/` as a folder.
3. In Settings → Pages, select **Deploy from a branch**, branch **main**, folder **/docs**, and save.
4. The expected address is https://glorykellogg.github.io/hasan-portfolio/ once GitHub finishes publishing.

If using another repository or account, update `website.site-url` in `_quarto.yml` and render again. After editing source pages, run `quarto render` and commit both the sources and `docs/`.

## Content to add

The five marketing pages contain independent concept outlines. Add actual campaign artwork and case studies when available. Shop currently links to the general Redbubble homepage; replace it with Hasan’s storefront and product links. Add Hasan’s résumé to the CV page when supplied.
