// @ts-check
const fs = require('fs-extra');
const execa = require('execa');

const CHANGES_FILE = 'doc-changes.json';
const CHANGES_FILTER = 'md';
/**
 *
 * @param {string} filter
 */
const getCurrentChanges = async (filter) => {
  const { stdout } = await execa('git', ['status']);

  const lines = stdout.split('\n');
  const changes = new Map();
  const changesRegex = new RegExp(`^\\s*renamed:\\s+(.*?)\\s->\\s((?:.*?)${filter})$`, 'i');

  for (const line of lines) {
    const change = line.trim();
    const matches = change.match(changesRegex);
    if (matches) {
      const [, source, destination] = matches;
      changes.set(source, destination);
    }
  }

  return changes;
};

/**
 *
 * @param {Map<string,string>} changes
 * @param {string} location
 */
const storeChanges = async (changes, location) => {
  await fs.writeFile(location, JSON.stringify(Object.fromEntries(changes), null, 2), 'utf-8');
};

/**
 *
 * @param {string} file
 * @param {string} filter
 */
const saveChanges = async (file, filter) => {
  const changes = await getCurrentChanges(filter);

  storeChanges(changes, file);
};

/**
 *
 * @param {string} file
 */
const readChanges = async (file) => {
  const content = JSON.parse(await fs.readFile(file, 'utf-8'));

  return new Map(Object.entries(content));
};

/**
 *
 * @param {Map<string,string>} changes
 */
const applyChanges = async (changes) => {
  for (const [source, destination] of changes) {
    await fs.move(source, destination);
  }
};

/**
 *
 * @param {string} changesFile
 */
const restoreChanges = async (changesFile) => {
  const changes = await readChanges(changesFile);
  applyChanges(changes);
};

/**
 *
 * @param {string} option
 */
const start = async (option) => {
  switch (option) {
    case 'save': await saveChanges(CHANGES_FILE, CHANGES_FILTER); break;
    case 'apply': await restoreChanges(CHANGES_FILE); break;
    default: console.log(`Please use "--save" to save current rename changes or "--apply" to restore the rename changes from ${CHANGES_FILE}`);
  }
};
