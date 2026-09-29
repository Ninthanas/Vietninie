const vm = require('vm');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'vietnamese-learning');

const context = {
  window: {},
  console: { log: () => {}, warn: () => {}, error: () => {} }
};
vm.createContext(context);

const files = [
  'vocabulary-a1.js', 'vocabulary-a2.js', 'vocabulary-b1.js',
  'vocabulary-b2.js', 'vocabulary-c1.js', 'vocabulary-c2.js',
  'vocabulary.js', 'lessons.js', 'conversations.js', 'quizzes.js'
];

for (const f of files) {
  const filePath = path.join(DATA_DIR, f);
  if (!fs.existsSync(filePath)) {
    process.stderr.write(`SKIP (not found): ${f}\n`);
    continue;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const code = raw.replace(/\bconst\s+/g, 'var ').replace(/\blet\s+/g, 'var ');
  try {
    vm.runInContext(code, context);
    process.stderr.write(`OK: ${f}\n`);
  } catch (e) {
    process.stderr.write(`ERROR in ${f}: ${e.message}\n`);
  }
}

const output = {
  vocabulary: context.VOCABULARY_DATA || context.window.VOCABULARY_DATA || [],
  lessons: context.LESSONS_DATA || [],
  conversations: context.CONVERSATIONS_DATA || [],
  quizzes: context.QUIZ_BANK || [],
  categories: context.VOCAB_CATEGORIES || context.window.VOCAB_CATEGORIES || [],
  levels: context.VIETNAMESE_LEVELS || context.window.VIETNAMESE_LEVELS || []
};

process.stderr.write(`Extracted: vocab=${output.vocabulary.length}, lessons=${output.lessons.length}, conversations=${output.conversations.length}, quizzes=${output.quizzes.length}\n`);
process.stdout.write(JSON.stringify(output));
