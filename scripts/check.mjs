import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const book = JSON.parse(await readFile(resolve(root, 'resources/booklet.json')));
const languages = JSON.parse(await readFile(resolve(root, 'resources/languages.json')));
const resources = JSON.parse(await readFile(resolve(root, 'resources/manifest.json')));
assert.ok(book.chapters.length > 0);
assert.equal(new Set(book.chapters.map(c => c.id)).size, book.chapters.length);
assert.equal(new Set(resources.map(r => r.id)).size, resources.length);
const sourceIds = new Set(book.sources.map(s => s.id));
for (const chapter of book.chapters) {
  for (const key of ['id', 'title', 'label', 'intro']) assert.ok(chapter[key], `Missing ${key}`);
  assert.ok(chapter.sections.length && chapter.checklist.length && chapter.minutes > 0);
  if(chapter.copyBlocks) { assert.equal(new Set(chapter.copyBlocks.map(block=>block.id)).size,chapter.copyBlocks.length); for(const block of chapter.copyBlocks)assert.ok(block.id && block.label && block.text); }
  for (const match of JSON.stringify(chapter).matchAll(/\[(S\d+)\]/g)) assert.ok(sourceIds.has(match[1]), `Missing source ${match[1]}`);
}
for (const language of ['en', 'hinglish']) {
  const translations = languages[language];
  assert.ok(translations && translations.chapters);
  for (const chapter of book.chapters) {
    const translated = translations.chapters[chapter.id];
    if (language === 'en' && chapter.id !== 'fresher-actions') continue;
    assert.ok(translated, `Missing ${language} chapter ${chapter.id}`);
    for (const field of ['title', 'label', 'intro']) assert.ok(typeof translated[field] === 'string' && translated[field]);
    assert.equal(translated.sections.length, chapter.sections.length, `${language} section count for ${chapter.id}`);
    assert.equal(translated.checklist.length, chapter.checklist.length, `${language} checklist order must preserve saved state`);
    for (let i = 0; i < chapter.sections.length; i++) {
      assert.ok(translated.sections[i].title && translated.sections[i].text);
      assert.deepEqual(translated.sections[i].text.match(/\[S\d+\]/g), chapter.sections[i].text.match(/\[S\d+\]/g), 'Source references must survive translation');
    }
    assert.ok(translated.checklist.every(item => typeof item === 'string' && item));
    if (chapter.example) assert.ok(translated.example?.label && translated.example?.text);
    if (chapter.copyBlocks) assert.deepEqual(translated.copyBlocks.map(block => [block.id, block.text]), chapter.copyBlocks.map(block => [block.id, block.text]), 'Application templates stay in professional English');
    assert.ok(!Object.hasOwn(translated, 'id') && !Object.hasOwn(translated, 'minutes'), 'Translation cannot change chapter identity');
  }
  assert.ok(Object.keys(translations.chapters).every(id => book.chapters.some(chapter => chapter.id === id)));
  if (translations.sourceNotes) assert.equal(translations.sourceNotes.length, book.sources.length);
}
for (const resource of resources) {
  assert.ok(resource.path.startsWith('resources/files/') && !resource.path.includes('..'));
  assert.ok(resource.chapters.length && resource.chapters.every(id => book.chapters.some(chapter => chapter.id === id)), `Unattached file ${resource.id}`);
  await access(resolve(root, resource.path));
}
await access(resolve(root, 'resources/files/job-ready-playbook.pdf'));
const publicContent = JSON.stringify({book,resources,languages}) + await readFile(resolve(root,'index.html'),'utf8');
assert.ok(!/linkedin\.com\/in\/|github\.com\/|mailto:|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(publicContent), 'Personal profile or email found in public content');
await access(resolve(root, 'assets/favicon.svg'));
console.log(`Checked ${book.chapters.length} chapters, ${book.sources.length} source references, ${resources.length} resource files, both reading languages, and public content privacy.`);
