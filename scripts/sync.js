#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const REQUIRED_METADATA_FIELDS = [
  "project_state_version",
  "last_reviewed",
  "review_owner"
];

const REQUIRED_CANONICAL_SECTIONS = [
  "Metadata",
  "Project purpose",
  "Architecture and important boundaries",
  "Source-of-truth surfaces",
  "Allowed paths",
  "Forbidden paths",
  "High-risk surfaces",
  "Validation commands",
  "Decision rights",
  "Destructive action policy",
  "Dependency and migration policy",
  "Documentation update policy",
  "Approval matrix",
  "Context drift controls",
  "Review standard",
  "Token and stopping rules",
  "Output conventions"
];

const args = parseArgs(process.argv.slice(2));
const repoRoot = path.resolve(args["repo-root"] || ".");
const mode = args.mode || "validate";
const targetModels = parseModels(args["target-models"] || "openai,claude,gemini");
const failOnDrift = toBoolean(args["fail-on-drift"], true);
const reportPath = path.resolve(repoRoot, args["report-path"] || ".ai/skills/reports/ai-skill-sync-report.json");
const actionRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const today = new Date().toISOString().slice(0, 10);

if (!["validate", "refresh"].includes(mode)) {
  exitWithError(`Unsupported mode "${mode}". Expected "validate" or "refresh".`);
}

const paths = {
  canonicalSpec: path.join(repoRoot, ".ai/skills/project-spec.md"),
  changeLog: path.join(repoRoot, ".ai/skills/change-log.md"),
  primaryAgent: path.join(repoRoot, ".agents/primary-agent.md"),
  executorAgent: path.join(repoRoot, ".agents/executor-agent.md"),
  governanceDir: path.join(repoRoot, ".ai/skills/governance")
};

const report = {
  repoRoot,
  mode,
  targetModels,
  timestamp: new Date().toISOString(),
  driftDetected: false,
  errors: [],
  warnings: [],
  refreshedFiles: [],
  checks: []
};

const canonicalSpec = readRequiredFile(paths.canonicalSpec, report, "Canonical project spec is required.");
const canonicalMetadata = extractBulletMetadata(canonicalSpec);

validateCanonicalMetadata(canonicalMetadata, report);
validateCanonicalSpec(canonicalSpec, report);

if (report.errors.length > 0) {
  finalize(reportPath, report, true);
}

const derivedFiles = [
  ...targetModels.map((model) => ({
    filePath: path.join(repoRoot, `.ai/skills/${model}/adapter.md`),
    label: `${model} adapter`,
    content: renderAdapter({ canonicalMetadata, model, today })
  })),
  {
    filePath: paths.primaryAgent,
    label: "primary agent policy",
    content: renderAgent({
      canonicalMetadata,
      templatePath: path.join(actionRoot, "assets/templates/primary-agent-template.md"),
      title: "Primary Agent Policy",
      today
    })
  },
  {
    filePath: paths.executorAgent,
    label: "executor agent policy",
    content: renderAgent({
      canonicalMetadata,
      templatePath: path.join(actionRoot, "assets/templates/executor-agent-template.md"),
      title: "Executor Agent Policy",
      today
    })
  },
  {
    filePath: path.join(paths.governanceDir, "approval-matrix.md"),
    label: "approval matrix",
    content: renderGovernanceDoc({
      canonicalMetadata,
      title: "Approval Matrix",
      templatePath: path.join(actionRoot, "assets/templates/approval-matrix-template.md"),
      driftCondition: "approval boundaries, allowed paths, or destructive action policy changes"
    })
  },
  {
    filePath: path.join(paths.governanceDir, "risk-catalog.md"),
    label: "risk catalog",
    content: renderGovernanceDoc({
      canonicalMetadata,
      title: "Risk Catalog",
      templatePath: path.join(actionRoot, "assets/templates/risk-catalog-template.md"),
      driftCondition: "risk taxonomy, stop rules, or observability expectations change"
    })
  },
  {
    filePath: path.join(paths.governanceDir, "context-drift-checklist.md"),
    label: "context drift checklist",
    content: renderGovernanceDoc({
      canonicalMetadata,
      title: "Context Drift Checklist",
      templatePath: path.join(actionRoot, "assets/templates/context-drift-checklist-template.md"),
      driftCondition: "canonical version, workflow contract, or repo boundaries change"
    })
  },
  {
    filePath: path.join(paths.governanceDir, "review-standard.md"),
    label: "review standard",
    content: renderGovernanceDoc({
      canonicalMetadata,
      title: "Review Standard",
      templatePath: path.join(actionRoot, "assets/templates/review-standard-template.md"),
      driftCondition: "review thresholds or approval rules change"
    })
  }
];

for (const derivedFile of derivedFiles) {
  processDerivedFile(derivedFile.filePath, derivedFile.content, report, mode, derivedFile.label);
}

const expectedChangeLog = renderChangeLog(canonicalMetadata, today);
processDerivedFile(paths.changeLog, expectedChangeLog, report, mode, "change log", { onlyCreateIfMissing: true });

finalize(reportPath, report, failOnDrift);

function validateCanonicalMetadata(metadata, reportState) {
  for (const field of REQUIRED_METADATA_FIELDS) {
    const ok = Boolean(metadata[field]);
    recordCheck(reportState, `canonical metadata: ${field}`, ok, ok ? undefined : `Missing required field "${field}".`);
    if (!ok) {
      reportState.errors.push(`Missing required canonical metadata field: ${field}`);
    }
  }
}

function validateCanonicalSpec(markdown, reportState) {
  for (const section of REQUIRED_CANONICAL_SECTIONS) {
    const present = markdown.includes(`## ${section}`);
    recordCheck(reportState, `canonical section: ${section}`, present, present ? undefined : `Missing section "${section}".`);
    if (!present) {
      reportState.errors.push(`Missing required canonical section: ${section}`);
    }
  }

  const placeholders = markdown.match(/\[[^\]\n]+\]/g) || [];
  if (placeholders.length > 0) {
    reportState.errors.push(`Canonical spec still contains placeholder tokens: ${placeholders.join(", ")}`);
    recordCheck(reportState, "canonical placeholders removed", false, "Template placeholders remain in the canonical spec.");
  } else {
    recordCheck(reportState, "canonical placeholders removed", true);
  }

  const requiredPhrases = [
    "human approval required:",
    "primary ai approval required:",
    "executor allowed without additional approval:",
    "known stale if changed:",
    "adapter derivation rule:",
    "mismatch handling:",
    "what reviewers must verify:",
    "what fails review immediately:"
  ];

  for (const phrase of requiredPhrases) {
    const present = markdown.includes(phrase);
    recordCheck(reportState, `canonical phrase: ${phrase}`, present, present ? undefined : `Missing phrase "${phrase}".`);
    if (!present) {
      reportState.errors.push(`Canonical spec is missing required governance detail: ${phrase}`);
    }
  }
}

function processDerivedFile(filePath, expectedContent, reportState, currentMode, label, options = {}) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    reportState.driftDetected = true;
    reportState.warnings.push(`Missing ${label}: ${relativeToRepo(filePath)}`);
    recordCheck(reportState, `derived file present: ${label}`, false, `Missing file ${relativeToRepo(filePath)}.`);
    if (currentMode === "refresh") {
      writeFile(filePath, expectedContent);
      reportState.refreshedFiles.push(relativeToRepo(filePath));
      recordCheck(reportState, `derived file refreshed: ${label}`, true);
    }
    return;
  }

  recordCheck(reportState, `derived file present: ${label}`, true);

  if (options.onlyCreateIfMissing) {
    return;
  }

  const current = fs.readFileSync(filePath, "utf8");
  if (current !== expectedContent) {
    reportState.driftDetected = true;
    reportState.warnings.push(`Drift detected in ${label}: ${relativeToRepo(filePath)}`);
    recordCheck(reportState, `derived file current: ${label}`, false, `Contents differ for ${relativeToRepo(filePath)}.`);
    if (currentMode === "refresh") {
      writeFile(filePath, expectedContent);
      reportState.refreshedFiles.push(relativeToRepo(filePath));
      recordCheck(reportState, `derived file refreshed: ${label}`, true);
    }
    return;
  }

  recordCheck(reportState, `derived file current: ${label}`, true);
}

function renderAdapter({ canonicalMetadata, model, today: currentDate }) {
  const displayName = model.toUpperCase();
  return [
    "---",
    `purpose: ${displayName} adapter derived from the canonical project spec`,
    `derived_from_version: ${canonicalMetadata.project_state_version}`,
    `last_updated: ${currentDate}`,
    `review_owner: ${canonicalMetadata.review_owner}`,
    `model: ${model}`,
    "---",
    "",
    `# ${displayName} Adapter`,
    "",
    "Use `.ai/skills/project-spec.md` as the source of truth.",
    "",
    "## Non-negotiable policy",
    "",
    "- Preserve approval thresholds from the canonical spec.",
    "- Do not relax destructive action controls, allowed paths, or stop rules.",
    "- Consult `.ai/skills/governance/approval-matrix.md` and `.ai/skills/governance/review-standard.md` before proposing risky edits.",
    "- When repo evidence conflicts with the canonical spec, stop and report drift instead of guessing.",
    "- Treat discussion as context only, never as approval.",
    "",
    `## ${displayName}-specific operating notes`,
    "",
    renderModelNotes(model).trimEnd(),
    "",
    "## Sync metadata",
    "",
    `- derived_from_version: ${canonicalMetadata.project_state_version}`,
    `- last_reviewed: ${canonicalMetadata.last_reviewed}`,
    `- review_owner: ${canonicalMetadata.review_owner}`
  ].join("\n") + "\n";
}

function renderAgent({ canonicalMetadata, templatePath, title, today: currentDate }) {
  const template = fs.readFileSync(templatePath, "utf8").trim();
  return [
    "---",
    `purpose: ${title} derived from the canonical project spec`,
    `derived_from_version: ${canonicalMetadata.project_state_version}`,
    `last_updated: ${currentDate}`,
    `review_owner: ${canonicalMetadata.review_owner}`,
    "---",
    "",
    template,
    "",
    "## Governance references",
    "",
    "- `.ai/skills/governance/approval-matrix.md`",
    "- `.ai/skills/governance/risk-catalog.md`",
    "- `.ai/skills/governance/context-drift-checklist.md`",
    "- `.ai/skills/governance/review-standard.md`",
    "",
    "## Sync metadata",
    "",
    "- canonical_spec: .ai/skills/project-spec.md",
    `- derived_from_version: ${canonicalMetadata.project_state_version}`,
    `- last_reviewed: ${canonicalMetadata.last_reviewed}`
  ].join("\n") + "\n";
}

function renderGovernanceDoc({ canonicalMetadata, title, templatePath, driftCondition }) {
  const template = fs.readFileSync(templatePath, "utf8").trim();
  return [
    "---",
    `purpose: ${title} derived from the canonical project spec`,
    `derived_from_version: ${canonicalMetadata.project_state_version}`,
    `last_updated: ${today}`,
    `review_owner: ${canonicalMetadata.review_owner}`,
    "---",
    "",
    template,
    "",
    "## Sync metadata",
    "",
    `- derived_from_version: ${canonicalMetadata.project_state_version}`,
    `- review_owner: ${canonicalMetadata.review_owner}`,
    `- drift_review_required_when: ${driftCondition}`
  ].join("\n") + "\n";
}

function renderChangeLog(canonicalMetadata, currentDate) {
  return [
    "# AI Skill Sync Change Log",
    "",
    "This file records meaningful updates to the canonical AI control layer.",
    "",
    `## ${currentDate}`,
    "",
    `- Initialized sync tracking for canonical spec version ${canonicalMetadata.project_state_version}.`
  ].join("\n") + "\n";
}

function renderModelNotes(model) {
  switch (model) {
    case "openai":
      return "- Prefer explicit file references and concrete tool plans.\n- Keep execution summaries concise and high signal.\n";
    case "claude":
      return "- Keep task framing strongly bounded to approved paths.\n- Restate drift mismatches before proposing edits.\n";
    case "gemini":
      return "- Emphasize source-of-truth files before speculative analysis.\n- Prefer short, explicit validation checklists over broad narration.\n";
    default:
      return "- Keep this adapter thin and aligned to the canonical spec.\n";
  }
}

function recordCheck(reportState, name, passed, detail) {
  reportState.checks.push({
    name,
    passed,
    detail: detail || null
  });
}

function readRequiredFile(filePath, reportState, message) {
  if (!fs.existsSync(filePath)) {
    reportState.errors.push(`${message} Missing file: ${relativeToRepo(filePath)}`);
    finalize(reportPath, reportState, true);
  }
  return fs.readFileSync(filePath, "utf8");
}

function ensureReportDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

function extractBulletMetadata(markdown) {
  const metadata = {};
  for (const line of markdown.split("\n")) {
    const match = line.match(/^- ([a-z_]+):\s*(.+)$/);
    if (match) {
      metadata[match[1]] = match[2].trim();
    }
  }
  return metadata;
}

function relativeToRepo(filePath) {
  return path.relative(repoRoot, filePath) || ".";
}

function parseModels(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function parseArgs(argv) {
  const parsed = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }
    const key = token.slice(2);
    const next = argv[index + 1];
    parsed[key] = next && !next.startsWith("--") ? next : "true";
    if (parsed[key] === next) {
      index += 1;
    }
  }
  return parsed;
}

function toBoolean(value, fallback) {
  if (value === undefined) {
    return fallback;
  }
  return String(value).toLowerCase() !== "false";
}

function exitWithError(message) {
  console.error(message);
  process.exit(1);
}

function finalize(filePath, reportState, failWhenDrifting) {
  ensureReportDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(reportState, null, 2)}\n`);

  const passedChecks = reportState.checks.filter((check) => check.passed).length;
  const summaryLines = [
    `Mode: ${reportState.mode}`,
    `Target models: ${reportState.targetModels.join(", ")}`,
    `Drift detected: ${reportState.driftDetected ? "yes" : "no"}`,
    `Errors: ${reportState.errors.length}`,
    `Warnings: ${reportState.warnings.length}`,
    `Checks passed: ${passedChecks}/${reportState.checks.length}`,
    `Refreshed files: ${reportState.refreshedFiles.length}`,
    `Report: ${filePath}`
  ];
  console.log(summaryLines.join("\n"));

  const outputFile = process.env.GITHUB_OUTPUT;
  if (outputFile) {
    fs.appendFileSync(outputFile, `drift-detected=${reportState.driftDetected}\n`);
    fs.appendFileSync(outputFile, `report-path=${filePath}\n`);
  }

  const stepSummary = process.env.GITHUB_STEP_SUMMARY;
  if (stepSummary) {
    const markdown = [
      "## AI Skill Sync",
      "",
      `- Mode: \`${reportState.mode}\``,
      `- Drift detected: \`${reportState.driftDetected}\``,
      `- Errors: \`${reportState.errors.length}\``,
      `- Warnings: \`${reportState.warnings.length}\``,
      `- Checks passed: \`${passedChecks}/${reportState.checks.length}\``,
      `- Refreshed files: \`${reportState.refreshedFiles.length}\``
    ];
    if (reportState.errors.length > 0) {
      markdown.push("", "### Errors", "", ...reportState.errors.map((item) => `- ${item}`));
    }
    if (reportState.warnings.length > 0) {
      markdown.push("", "### Warnings", "", ...reportState.warnings.map((item) => `- ${item}`));
    }
    fs.appendFileSync(stepSummary, `${markdown.join("\n")}\n`);
  }

  if (reportState.errors.length > 0) {
    process.exit(1);
  }
  if (failWhenDrifting && reportState.driftDetected && reportState.mode === "validate") {
    process.exit(1);
  }
  process.exit(0);
}
