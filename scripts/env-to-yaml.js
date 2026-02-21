#!/usr/bin/env node
/**
 * Read one or more .env files and output YAML for gcloud run services update --env-vars-file.
 * Later files override earlier. Skips PORT (reserved by Cloud Run).
 * Usage: node scripts/env-to-yaml.js .env
 *        node scripts/env-to-yaml.js .env .env.cloudrun
 */
const fs = require('fs');
const path = require('path');

const RESERVED = ['PORT'];

function escapeYamlValue(s) {
  if (s === null || s === undefined) return '""';
  const str = String(s).trim();
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
  return `"${escaped}"`;
}

function parseEnvFile(content) {
  const out = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const rest = trimmed.replace(/^export\s+/, '').trim();
    const eq = rest.indexOf('=');
    if (eq === -1) continue;
    const key = rest.slice(0, eq).trim();
    let value = rest.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    if (!key || RESERVED.includes(key)) continue;
    out[key] = value;
  }
  return out;
}

function main() {
  const baseDir = path.join(__dirname, '..');
  const files = process.argv.slice(2).length
    ? process.argv.slice(2).map((p) => path.isAbsolute(p) ? p : path.join(baseDir, p))
    : [path.join(baseDir, '.env')];

  const merged = {};
  for (const envPath of files) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf8');
    Object.assign(merged, parseEnvFile(content));
  }

  const lines = Object.entries(merged).map(([key, value]) => `${key}: ${escapeYamlValue(value)}`);
  process.stdout.write(lines.join('\n') + '\n');
}

main();
