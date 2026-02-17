/*import { loadIntents } from './utils.js';
import { preToolHook, postToolHook } from './hooks.js';

async function main() {
  // Load active intents
  const intents = loadIntents();
  const currentIntent = intents[0]; // Select first intent for demo
  console.log(`Current intent: ${currentIntent.id} - ${currentIntent.description}`);

  // Example tool action
  const action = {
    type: 'delete_file',
    filePath: 'temp/test.tmp'
  };

  // PreToolUse hook
  await preToolHook(action, currentIntent);

  // Simulate tool execution
  const result = {
    content: `Deleted ${action.filePath}`,
    filePath: action.filePath
  };
  console.log(`Executing action: ${result.content}`);

  // PostToolUse hook
  await postToolHook(action, result, currentIntent);

  console.log('Action completed successfully!');
}

main().catch(err => console.error('Error:', err.message));

import { loadIntents } from './utils.js';
import { preToolHook, postToolHook } from './hooks.js';
import { acquireFile, releaseFile } from './conflict.js';


Run a single agent on a given intent and action 
async function runAgent(agentName, intentId, action) {
  const intents = loadIntents();
  const currentIntent = intents.find(i => i.id === intentId);
  if (!currentIntent) {
    console.log(`[${agentName}] Error: Intent "${intentId}" not found`);
    return;
  }

  console.log(`\n[${agentName}] Current intent: ${currentIntent.id} - ${currentIntent.description}`);

  // Conflict check: is another agent working on this file?
  const conflictCheck = acquireFile(agentName, action.filePath);
  if (conflictCheck.conflict) {
    console.log(`[${agentName}] Conflict detected! File is currently used by ${conflictCheck.owner}`);
    return; // skip execution
  }

  try {
    // PreToolUse hook
    await preToolHook(action, currentIntent);

    // Simulate tool execution
    const result = { content: `${agentName} executed ${action.type}`, filePath: action.filePath };
    console.log(`[${agentName}] Executing action: ${result.content}`);

    // PostToolUse hook
    await postToolHook(action, result, currentIntent);

    console.log(`[${agentName}] Action completed successfully!`);
  } catch (err) {
    console.error(`[${agentName}] Error during execution: ${err.message}`);
  } finally {
    // Release file for other agents
    releaseFile(agentName, action.filePath);
  }
}


 Main workflow: simulate multiple agents
 
async function main() {
  // Define agents and their actions
  const agentTasks = [
    { agent: 'AgentA', intentId: 'refactor-function', action: { type: 'edit_file', filePath: 'src/app.js' } },
    { agent: 'AgentB', intentId: 'delete-temp-files', action: { type: 'delete_file', filePath: 'src/app.js' } },
    { agent: 'AgentC', intentId: 'add-logging', action: { type: 'edit_file', filePath: 'src/utils.js' } }
  ];

  // Run all agents in parallel safely
  await Promise.all(agentTasks.map(task => runAgent(task.agent, task.intentId, task.action)));
}

main().catch(err => console.error('Fatal Error:', err.message)); */

import { loadIntents } from './utils.js';
import { preToolHook, postToolHook } from './hooks.js';
import { acquireFiles, releaseFiles } from './conflict.js';

/**
 * Run a single agent
 */
async function runAgent(agentName, intentId, action, priority = 0) {
  const intents = loadIntents();
  let currentIntent = intents.find(i => i.id === intentId);

  console.log(`\n[${agentName}] Starting agent`);

  // Auto-assign intent if missing
  if (!currentIntent) {
    currentIntent = intents[0];
    console.log(`[${agentName}] Auto-assigned intent: ${currentIntent.id}`);
  }

  // Support multi-file actions
  const filePaths = Array.isArray(action.filePath) ? action.filePath : [action.filePath];

  // Acquire files with priority
  const { conflicts, acquired } = acquireFiles(agentName, filePaths, priority);
  if (conflicts.length > 0) {
    conflicts.forEach(c => console.log(`[${agentName}] Conflict: ${c.filePath} is locked by ${c.owner}`));
    if (acquired.length === 0) return; // nothing to do
  }

  try {
    // PreToolUse
    await preToolHook(action, currentIntent);

    // Execute action
    const result = { content: `${agentName} executed ${action.type}`, filePath: acquired };
    console.log(`[${agentName}] Executing action on files: ${acquired.join(', ')}`);

    // PostToolUse
    await postToolHook(action, result, currentIntent);
    console.log(`[${agentName}] Action completed successfully`);
  } catch (err) {
    console.error(`[${agentName}] Error: ${err.message}`);
  } finally {
    releaseFiles(agentName, acquired);
  }
}

/**
 * Main multi-agent workflow
 */
async function main() {
  const agentTasks = [
    {
      agent: 'AgentA',
      intentId: 'refactor-function',
      action: { type: 'edit_file', filePath: ['src/app.js', 'src/utils.js'] },
      priority: 1
    },
    {
      agent: 'AgentB',
      intentId: 'delete-temp-files',
      action: { type: 'delete_file', filePath: ['src/app.js'] },
      priority: 0
    },
    {
      agent: 'AgentC',
      intentId: null, // auto-assign
      action: { type: 'edit_file', filePath: ['src/hooks.js'] },
      priority: 2
    }
  ];

  // Run all agents in parallel
  await Promise.all(agentTasks.map(task =>
    runAgent(task.agent, task.intentId, task.action, task.priority)
  ));
}

main().catch(err => console.error('Fatal Error:', err.message));


