# Portfolio-site (Eleventy)

Eenvoudige portfolio-site met Eleventy 3. Inhoud in Markdown, afbeeldingen worden automatisch omgezet naar WebP/JPEG in meerdere formaten, en de site wordt via GitHub Actions gepubliceerd op GitHub Pages.

## Lokaal werken

```bash
npm install
npm start        # ontwikkelserver op http://localhost:8080
npm run build    # bouwt de site naar _site/
```

Vereist Node.js 20 of hoger.

## Structuur

```
src/
  _data/site.json          naam, tagline, e-mail (hier aanpassen)
  _includes/layouts/       base.njk (kader) en project.njk (projectpagina)
  projecten/*.md           één bestand per project
  img/                     originele afbeeldingen (worden bij het bouwen geoptimaliseerd)
  css/style.css            opmaak
  static/                  bestanden die ongewijzigd in de root komen (CNAME, favicon, robots.txt)
  index.njk                startpagina met projectoverzicht
  over.md, contact.md      losse pagina's
```

## Een project toevoegen

1. Zet de foto's in `src/img/`.
2. Kopieer `src/projecten/voorbeeld-een.md`, geef het een nieuwe naam en pas de gegevens bovenaan aan (`title`, `jaar`, `rol`, `volgorde`, `cover`, `cover_alt`).
3. Voeg afbeeldingen toe in de tekst met:
   ```
   {% image "mijn-foto.jpg", "Beschrijving voor screenreaders", "(min-width: 800px) 60vw, 100vw" %}
   ```
   De alt-tekst is verplicht: de build stopt als die ontbreekt.

Projecten worden op de startpagina gesorteerd op `volgorde` (laagste eerst).

Gebruik JPG of PNG als bronbestand. HEIC (iPhone) wordt niet ondersteund.

## Publiceren op GitHub Pages

1. Maak een (privé of publieke) repository op GitHub en push dit project naar de `main`-branch.
2. Ga in de repository naar **Settings → Pages** en kies bij *Source* voor **GitHub Actions**.
3. Bij elke push naar `main` bouwt en publiceert de workflow in `.github/workflows/deploy.yml` de site automatisch. De site staat dan op `https://<gebruikersnaam>.github.io/<repo-naam>/`.

> Privé-repositories kunnen enkel Pages gebruiken met een betaald GitHub-plan. Bij een gratis account moet de repository publiek zijn.

### Eigen domein

1. Maak `src/static/CNAME` aan met één regel: je domein (bv. `www.voorbeeld.be`).
2. Verwijder in `.github/workflows/deploy.yml` het blok `env: PATH_PREFIX: ...` bij de buildstap, zodat de site op `/` staat.
3. Stel bij je domeinregistrar een CNAME-record in naar `<gebruikersnaam>.github.io` en vul het domein in bij **Settings → Pages**.

### Publiceren op eigen hosting (rsync)

Alternatief voor GitHub Pages: voeg dit toe aan `package.json` en pas gebruiker, host en pad aan.

```json
"deploy": "npm run build && rsync -avz --delete _site/ gebruiker@jouwhost.be:~/public_html/"
```

Test eerst met `--dry-run`.
