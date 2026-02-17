import fs from 'fs';
import crypto from 'crypto';
import yaml from 'js-yaml';

// Compute SHA-256 hash of content
export function computeHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Load active intents from YAML
export function loadIntents() {
  const file = fs.readFileSync('.orchestration/active_intents.yaml', 'utf8');
  return yaml.load(file).intents;
}

// Append a trace log
export function logTrace(trace) {
  fs.appendFileSync('.orchestration/agent_trace.jsonl', JSON.stringify(trace) + '\n');
}
