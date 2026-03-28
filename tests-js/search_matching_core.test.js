import test from "node:test";
import assert from "node:assert/strict";

import * as core from "../docs/search_matching_core.js";

function journalRecord({
  id,
  title,
  publisher,
  country = "ID",
  subjects = [],
  keywords = [],
  lastUpdated = "2026-01-01T00:00:00Z",
  aimsScopeUrl = "",
}) {
  return {
    id,
    last_updated: lastUpdated,
    bibjson: {
      title,
      keywords,
      subject: subjects.map((term) => ({ term })),
      publisher: { name: publisher, country },
      ref: aimsScopeUrl ? { aims_scope: aimsScopeUrl } : {},
    },
  };
}

function articleRecord({
  id,
  title,
  abstract = "",
  journalTitle = "",
  publisher = "",
  keywords = [],
  subjects = [],
  lastUpdated = "2026-01-01T00:00:00Z",
}) {
  return {
    id,
    last_updated: lastUpdated,
    bibjson: {
      title,
      abstract,
      keywords,
      subject: subjects.map((term) => ({ term })),
      journal: {
        title: journalTitle,
        publisher,
        issns: [],
      },
    },
  };
}

test("sanitizeExternalUrl allows http/https and rejects dangerous or malformed schemes", () => {
  assert.equal(core.sanitizeExternalUrl("https://example.org/path"), "https://example.org/path");
  assert.equal(core.sanitizeExternalUrl("http://example.org"), "http://example.org/");
  assert.equal(core.sanitizeExternalUrl("javascript:alert(1)"), "");
  assert.equal(core.sanitizeExternalUrl("data:text/html,boom"), "");
  assert.equal(core.sanitizeExternalUrl("vbscript:msgbox(1)"), "");
  assert.equal(core.sanitizeExternalUrl("hhttps://broken.example.org"), "");
});

test("rankSearchResults keeps exact journal title above newer but less relevant journals", () => {
  const target = journalRecord({
    id: "target",
    title: "Jurnal Teknik Industri",
    publisher: "Universitas Industri Nusantara",
    subjects: ["Industrial engineering"],
    keywords: ["manufacturing", "operations"],
    lastUpdated: "2024-01-01T00:00:00Z",
  });
  const newer = journalRecord({
    id: "newer",
    title: "Journal of Electrical Systems and Information Technology",
    publisher: "Recent Tech Publisher",
    subjects: ["Electrical engineering"],
    keywords: ["circuits", "systems"],
    lastUpdated: "2026-03-17T11:36:37Z",
  });
  const ranked = core.rankSearchResults("Jurnal Teknik Industri", [newer, target], []);
  assert.equal(ranked.journals[0].id, "target");
});

test("rankSearchResults prioritizes topic relevance over recency for industrial engineering", () => {
  const relevant = journalRecord({
    id: "relevant",
    title: "Advanced Industrial and Engineering Polymer Research",
    publisher: "KeAi Communications Co., Ltd.",
    subjects: ["Industrial engineering"],
    keywords: ["industrial", "engineering", "manufacturing"],
    lastUpdated: "2025-01-15T10:37:23Z",
  });
  const irrelevantRecent = journalRecord({
    id: "recent",
    title: "Journal of Electrical Systems and Information Technology",
    publisher: "SpringerOpen",
    subjects: ["Electrical engineering"],
    keywords: ["electronics", "systems"],
    lastUpdated: "2026-03-17T11:36:37Z",
  });
  const ranked = core.rankSearchResults("industrial engineering", [irrelevantRecent, relevant], []);
  assert.equal(ranked.journals[0].id, "relevant");
});

test("publisher groups inherit exact publisher relevance from child results", () => {
  const target = journalRecord({
    id: "publisher-target",
    title: "Studia Philosophiae Christianae",
    publisher: "Cardinal Stefan Wyszynski University in Warsaw",
    subjects: ["Philosophy"],
    lastUpdated: "2026-03-24T19:05:52Z",
  });
  const other = journalRecord({
    id: "publisher-other",
    title: "Another Journal",
    publisher: "Other University Press",
    subjects: ["Philosophy"],
    lastUpdated: "2026-03-25T00:00:00Z",
  });
  const ranked = core.rankSearchResults("Cardinal Stefan Wyszynski University in Warsaw", [other, target], []);
  const publishers = core.derivePublisherSearchGroups(ranked.journals, ranked.articles);
  assert.equal(publishers[0].title, "Cardinal Stefan Wyszynski University in Warsaw");
});

test("detectAbstractLanguage separates English and Indonesian abstracts", () => {
  const english = core.detectAbstractLanguage(
    "This study investigates tourism recovery using mixed methods. The results show that local policy, visitor confidence, and community participation strongly affect recovery outcomes. The analysis compares survey responses, interviews, and operational data across several destinations and highlights how adaptive governance improves resilience in the tourism sector."
  );
  const indonesian = core.detectAbstractLanguage(
    "Penelitian ini menganalisis pemulihan pariwisata menggunakan pendekatan campuran. Hasil penelitian menunjukkan bahwa kebijakan lokal, kepercayaan pengunjung, dan partisipasi masyarakat sangat memengaruhi pemulihan destinasi. Analisis dilakukan terhadap data survei, wawancara, dan data operasional pada beberapa kawasan sehingga strategi adaptif dapat dirumuskan."
  );
  assert.equal(english.language, "en");
  assert.equal(english.supported, true);
  assert.equal(indonesian.language, "id");
  assert.equal(indonesian.supported, true);
});

test("buildMatchingCandidateText excludes aims scope URLs from ranking text", () => {
  const candidate = {
    journal: journalRecord({
      id: "journal-1",
      title: "Tourism Critiques",
      publisher: "Emerald Publishing",
      subjects: ["Tourism"],
      aimsScopeUrl: "https://example.org/about/scope",
    }),
    seedArticles: [
      articleRecord({
        id: "article-1",
        title: "Community resilience in tourism destinations",
        abstract: "Tourism resilience is studied through policy and community participation.",
        journalTitle: "Tourism Critiques",
        publisher: "Emerald Publishing",
      }),
    ],
  };
  const text = core.buildMatchingCandidateText(candidate);
  assert.equal(text.includes("example"), false);
  assert.equal(text.includes("scope"), false);
  assert.equal(text.includes("tourism"), true);
});

test("rankMatchingCandidates remains stable when semantic scores are unavailable", () => {
  const profile = core.buildAbstractProfile(
    "This study investigates tourism governance, destination recovery, community participation, and policy learning after crisis events. The analysis highlights adaptive planning, tourism stakeholders, and local resilience in destination management."
  );
  const candidates = [
    {
      entityKey: "one",
      journal: journalRecord({
        id: "one",
        title: "Tourism Governance Review",
        publisher: "Travel Research Society",
        subjects: ["Tourism"],
        keywords: ["governance", "tourism", "policy"],
      }),
      seedArticles: [],
      semanticScore: null,
    },
    {
      entityKey: "two",
      journal: journalRecord({
        id: "two",
        title: "Applied Polymer Bulletin",
        publisher: "Materials Press",
        subjects: ["Polymer science"],
        keywords: ["materials"],
      }),
      seedArticles: [],
      semanticScore: null,
    },
  ];
  const ranked = core.rankMatchingCandidates(profile, candidates, { rankingMode: "lexical", resultLimit: 5 });
  assert.equal(ranked[0].journal.id, "one");
  assert.equal(ranked[0].rankingMode, "lexical");
  assert.equal(Array.isArray(ranked[0].matchedTerms), true);
});
