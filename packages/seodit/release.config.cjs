module.exports = {
  branches: ["main"],
  tagFormat: "seodit-v${version}",
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
        releaseRules: [
          { scope: "seodit", breaking: true, release: "major" },
          { scope: "seodit", type: "feat", release: "minor" },
          { scope: "seodit", type: "fix", release: "patch" },
          { scope: "seodit", type: "perf", release: "patch" },
          { scope: "seodit", type: "chore", release: false },
          { scope: "seodit", type: "docs", release: false },
          { scope: "seodit", type: "test", release: false },
          { scope: "seodit", type: "refactor", release: false },
          { scope: "seodit", type: "ci", release: false },
          { scope: "seodit", type: "build", release: false },
          { scope: "!seodit", release: false },
        ],
      },
    ],
    "@semantic-release/release-notes-generator",
    [
      "@semantic-release/npm",
      {
        pkgRoot: ".",
      },
    ],
    [
      "@semantic-release/git",
      {
        assets: ["package.json"],
        message: "chore(seodit): release ${nextRelease.version} [skip ci]",
      },
    ],
    [
      "@semantic-release/github",
      {
        labels: false,
        successComment: false,
        failComment: false,
      },
    ],
  ],
};
