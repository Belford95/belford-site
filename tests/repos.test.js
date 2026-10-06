// Tests for the #repos section (SPEC.md). Run with: npm test
// Loads public/index.html in jsdom, mocks fetch, then runs public/repos.js against it.
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const HTML = fs.readFileSync(path.join(PUBLIC_DIR, "index.html"), "utf8");
const REPOS_JS = fs.readFileSync(path.join(PUBLIC_DIR, "repos.js"), "utf8");
const LOADING_TEXT = "Loading repositories";

const MOCK_REPOS = [
  {
    name: "belford-site",
    description: "Personal portfolio site",
    language: "HTML",
    stargazers_count: 2,
    html_url: "https://github.com/Belford95/belford-site",
  },
  {
    name: "algo-practice",
    description: null,
    language: null,
    stargazers_count: 0,
    html_url: "https://github.com/Belford95/algo-practice",
  },
];

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status: status,
    json: () => Promise.resolve(body),
  };
}

const mockReturnsRepos = () => Promise.resolve(jsonResponse(200, MOCK_REPOS));
const mockReturnsEmpty = () => Promise.resolve(jsonResponse(200, []));
const mockReturnsError = () => Promise.resolve(jsonResponse(403, { message: "API rate limit exceeded" }));

// Render the page with the given fetch mock and wait until repos.js has replaced the loading message.
async function renderRepos(fetchMock) {
  const dom = new JSDOM(HTML, { runScripts: "outside-only" });
  dom.window.fetch = fetchMock;
  dom.window.eval(REPOS_JS);

  const section = dom.window.document.getElementById("repos");
  for (let i = 0; i < 50 && section.textContent.includes(LOADING_TEXT); i++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.ok(!section.textContent.includes(LOADING_TEXT), "#repos never finished loading");
  return { window: dom.window, section: section };
}

// Visible: has text and neither it nor an ancestor is hidden.
function isVisible(window, element) {
  if (!element.textContent.trim()) return false;
  for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
    if (node.hidden || window.getComputedStyle(node).display === "none") return false;
  }
  return true;
}

function textElements(section) {
  return Array.from(section.querySelectorAll("*")).filter((el) => el.children.length === 0);
}

// Text that #repos shows before repos.js runs (heading, intro, loading message).
const STATIC_TEXTS = new Set(
  textElements(new JSDOM(HTML).window.document.getElementById("repos")).map((el) => el.textContent.trim())
);

// A visible element added by repos.js, i.e. not part of the static markup.
function findMessage(window, section) {
  return textElements(section).find(
    (el) => isVisible(window, el) && !STATIC_TEXTS.has(el.textContent.trim())
  );
}

test("returns repos: #repos shows each repo's name and a link to its github.com page", async () => {
  const { window, section } = await renderRepos(mockReturnsRepos);

  for (const repo of MOCK_REPOS) {
    const nameElement = textElements(section).find((el) => el.textContent.includes(repo.name));
    assert.ok(nameElement && isVisible(window, nameElement), `${repo.name} is not visible in #repos`);

    const links = Array.from(section.querySelectorAll("a[href]"));
    assert.ok(
      links.some((a) => a.href === repo.html_url),
      `#repos has no link to ${repo.html_url}`
    );
  }
});

test("empty list: #repos shows a visible message and no repo links", async () => {
  const { window, section } = await renderRepos(mockReturnsEmpty);

  const message = findMessage(window, section);
  assert.ok(message, "#repos shows no visible message");
  assert.strictEqual(section.querySelectorAll("a[href]").length, 0, "#repos should contain no links");
});

test("API error: #repos shows a visible message and no repo links", async () => {
  const { window, section } = await renderRepos(mockReturnsError);

  const message = findMessage(window, section);
  assert.ok(message, "#repos shows no visible message");
  assert.strictEqual(section.querySelectorAll("a[href]").length, 0, "#repos should contain no links");
});
