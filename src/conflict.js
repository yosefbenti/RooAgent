/**
 * Multi-file conflict manager with priorities
 * Tracks which agent is working on which file
 * Allows preemption if agent has higher priority
 */

const activeFiles = new Map(); // Map<filePath, { agent, priority }>

/**
 * Acquire one or multiple files for an agent
 * @param {string} agentName
 * @param {string[]} filePaths
 * @param {number} priority Higher number = higher priority
 * @returns {object} { conflicts: [{filePath, owner}], acquired: [filePaths] }
 */
export function acquireFiles(agentName, filePaths, priority = 0) {
  const conflicts = [];
  const acquired = [];

  filePaths.forEach(file => {
    if (!activeFiles.has(file)) {
      activeFiles.set(file, { agent: agentName, priority });
      acquired.push(file);
    } else {
      const current = activeFiles.get(file);
      if (priority > current.priority) {
        console.log(`[${agentName}] Preempting ${current.agent} on ${file} due to higher priority`);
        activeFiles.set(file, { agent: agentName, priority });
        acquired.push(file);
      } else {
        conflicts.push({ filePath: file, owner: current.agent });
      }
    }
  });

  return { conflicts, acquired };
}

/**
 * Release one or multiple files
 * @param {string} agentName
 * @param {string[]} filePaths
 */
export function releaseFiles(agentName, filePaths) {
  filePaths.forEach(file => {
    const current = activeFiles.get(file);
    if (current && current.agent === agentName) {
      activeFiles.delete(file);
    }
  });
}

/**
 * Check if a file is currently locked
 */
export function isLocked(filePath) {
  return activeFiles.has(filePath);
}
