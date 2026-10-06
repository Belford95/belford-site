# belford-site spec

- #hero: shows the owner's name, a one-line professional tagline, and email, GitHub and LinkedIn links.
- #about: a short professional bio.
- #skills: the owner's key skills or areas of focus.
- #projects: a few curated projects, each with a title, a one-line description and a link.
- #repos: when the GitHub API returns repos, #repos shows each repo's name and a link to that repo's page on github.com. When the API returns an empty list or an error, #repos shows a visible text message and no repo links.
- #contact: email, GitHub and LinkedIn links.
- Layout: responsive, with no horizontal scroll at 375px wide.
- Theme: a nav button toggles a `dark` class on `<body>`; the choice is kept for the session.
