(function () {
  "use strict";

  var REPOS_URL = "https://api.github.com/users/Belford95/repos?sort=updated&per_page=12";
  var list = document.getElementById("repo-list");
  var year = document.getElementById("year");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  if (!list) {
    return;
  }

  function showMessage(text) {
    list.innerHTML = "";
    var p = document.createElement("p");
    p.className = "status-message";
    p.textContent = text;
    list.appendChild(p);
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function buildCard(repo) {
    var card = el("article", "card");

    card.appendChild(el("h3", "repo-name", repo.name));
    card.appendChild(el("p", "", repo.description || "No description provided."));

    var meta = el("div", "repo-meta");
    meta.appendChild(el("span", "", repo.language || "No primary language"));
    var stars = repo.stargazers_count || 0;
    meta.appendChild(el("span", "", "★ " + stars + (stars === 1 ? " star" : " stars")));
    card.appendChild(meta);

    var link = el("a", "card-link", "View on GitHub");
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener";
    card.appendChild(link);

    return card;
  }

  fetch(REPOS_URL, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("GitHub API responded with " + response.status);
      }
      return response.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || repos.length === 0) {
        showMessage("No public repositories to show yet.");
        return;
      }
      list.innerHTML = "";
      repos.forEach(function (repo) {
        list.appendChild(buildCard(repo));
      });
    })
    .catch(function () {
      showMessage("Couldn't load repositories right now. You can browse them on GitHub at github.com/Belford95.");
    });
})();
