import 'dotenv/config';
import mongoose from 'mongoose';
import { Subject, Chapter, Resource, Question } from './models.js';

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([Subject, Chapter, Resource, Question].map((m) => m.deleteMany({})));

const sci10 = await Subject.create({ name: 'Science', level: '10' });
const math10 = await Subject.create({ name: 'Mathematics', level: '10' });
const bio12 = await Subject.create({ name: 'Biology', level: '12' });
const bioNeet = await Subject.create({ name: 'Biology', level: 'NEET' });

const life = await Chapter.create({ subject: sci10._id, number: 5, title: 'Life Processes',
  notes: 'Life processes: nutrition, respiration, transportation, excretion.\nAdd your own written notes here.' });
const quad = await Chapter.create({ subject: math10._id, number: 4, title: 'Quadratic Equations' });
const repro = await Chapter.create({ subject: bio12._id, number: 1, title: 'Sexual Reproduction in Flowering Plants' });

// ---- Class 9 and 11: subjects only. Chapter lists differ by edition, so import them from the official CBSE syllabus (Admin > Bulk import > Syllabus).
for (const [lvl, list] of [['9', subjects9seed()], ['11', subjects11seed()]]) for (const name of list) await Subject.create({ name, level: lvl });
function subjects9seed() { return ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi']; }
function subjects11seed() { return ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Hindi', 'Economics', 'Accountancy', 'Business Studies', 'Political Science']; }

// ---- JEE Main (Paper 1, B.E./B.Tech): units follow the NTA syllabus, which is based on NCERT Class 11 and 12.
// NTA publishes the syllabus each cycle. Check https://jeemain.nta.ac.in/ and update from the Admin panel.
const JEE = {
  Physics: ['Units and Measurements', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Gravitation', 'Properties of Solids and Liquids', 'Thermodynamics', 'Kinetic Theory of Gases', 'Oscillations and Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current and Magnetism', 'Electromagnetic Induction and Alternating Currents', 'Electromagnetic Waves', 'Optics', 'Dual Nature of Matter and Radiation', 'Atoms and Nuclei', 'Electronic Devices', 'Experimental Skills'],
  Chemistry: ['Some Basic Concepts in Chemistry', 'Atomic Structure', 'Chemical Bonding and Molecular Structure', 'Chemical Thermodynamics', 'Solutions', 'Equilibrium', 'Redox Reactions and Electrochemistry', 'Chemical Kinetics', 'Classification of Elements and Periodicity in Properties', 'p-Block Elements', 'd- and f-Block Elements', 'Co-ordination Compounds', 'Purification and Characterisation of Organic Compounds', 'Some Basic Principles of Organic Chemistry', 'Hydrocarbons', 'Organic Compounds Containing Halogens', 'Organic Compounds Containing Oxygen', 'Organic Compounds Containing Nitrogen', 'Biomolecules', 'Principles Related to Practical Chemistry'],
  Mathematics: ['Sets, Relations and Functions', 'Complex Numbers and Quadratic Equations', 'Matrices and Determinants', 'Permutations and Combinations', 'Binomial Theorem and its Simple Applications', 'Sequences and Series', 'Limits, Continuity and Differentiability', 'Integral Calculus', 'Differential Equations', 'Co-ordinate Geometry', 'Three Dimensional Geometry', 'Vector Algebra', 'Statistics and Probability', 'Trigonometry'],
};
for (const [name, chapters] of Object.entries(JEE)) {
  const sub = await Subject.create({ name, level: 'JEE' });
  await Chapter.insertMany(chapters.map((title, i) => ({ subject: sub._id, number: i + 1, title })));
}

// Library resources are LINKS to official sources, not copies.
// Real deep links change often, so these point to the official landing pages.
// Replace/extend them from the Admin panel (Import tab) with exact chapter/paper links.
const NCERT = 'https://ncert.nic.in/textbook.php';
const res = [];
const add = (o) => res.push({ language: 'English', ...o });

const subjects9 = ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'];
const subjects10 = ['Science', 'Mathematics', 'Social Science', 'English', 'Hindi'];
const subjects11 = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Hindi', 'Economics', 'Accountancy', 'Business Studies', 'Political Science'];
const subjects12 = ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'English', 'Hindi', 'Economics', 'History', 'Political Science', 'Accountancy'];
for (const [lvl, list] of [['9', subjects9], ['10', subjects10], ['11', subjects11], ['12', subjects12]]) {
  for (const sub of list) {
    add({ type: 'book', level: lvl, subjectName: sub, board: 'NCERT', provider: 'NCERT', title: `NCERT ${sub} textbook, Class ${lvl}`,
      description: `Official NCERT textbook. On the NCERT page choose Class ${lvl}, then ${sub}.` + (lvl === '9' ? ' Class 9 books were revised for 2026-27, so pick the latest edition.' : ''), url: NCERT, tags: ['ncert', 'textbook', sub.toLowerCase()], featured: ['Science', 'Physics', 'Mathematics'].includes(sub) });
    add({ type: 'notes', level: lvl, subjectName: sub, board: 'CBSE', provider: 'CBSE', title: `CBSE ${sub} syllabus and curriculum, Class ${lvl}`,
      description: 'Official CBSE curriculum, marking scheme and course structure.', url: 'https://cbseacademic.nic.in/', tags: ['syllabus', 'curriculum', sub.toLowerCase()] });
    add({ type: 'paper', level: lvl, subjectName: sub, board: 'CBSE', provider: 'CBSE', title: `CBSE sample and previous papers: ${sub}, Class ${lvl}`,
      description: 'Sample question papers with marking schemes from CBSE Academic.', url: 'https://cbseacademic.nic.in/', tags: ['sample paper', 'previous year', sub.toLowerCase()] });
  }
}
for (const [lvl, sub] of [['10', 'Science'], ['10', 'Mathematics'], ['12', 'Physics'], ['12', 'Chemistry'], ['12', 'Mathematics'], ['12', 'Biology']]) {
  add({ type: 'book', level: lvl, subjectName: sub, board: 'NCERT', provider: 'NCERT', language: 'Hindi', title: `NCERT ${sub} textbook (Hindi medium), Class ${lvl}`,
    description: 'Hindi-medium NCERT textbook from the official site.', url: NCERT, tags: ['ncert', 'hindi medium'] });
}
add({ type: 'video', level: '10', subjectName: 'Science', provider: 'DIKSHA', board: 'CBSE', featured: true, title: 'DIKSHA: Class 10 lessons, videos and practice', description: 'Government learning platform with QR-coded textbook content, videos and exercises.', url: 'https://diksha.gov.in/', tags: ['video', 'diksha'] });
add({ type: 'video', level: '12', subjectName: 'Physics', provider: 'DIKSHA', board: 'CBSE', title: 'DIKSHA: Class 12 lessons, videos and practice', description: 'Chapter-linked videos and exercises aligned to NCERT.', url: 'https://diksha.gov.in/', tags: ['video', 'diksha'] });
add({ type: 'video', level: '12', subjectName: 'Chemistry', provider: 'SWAYAM Prabha', title: 'SWAYAM Prabha: free educational TV channels', description: 'DTH channels streaming lecture content around the clock.', url: 'https://www.swayamprabha.gov.in/', tags: ['video', 'lectures'] });
add({ type: 'notes', level: '12', subjectName: 'Mathematics', provider: 'SWAYAM', title: 'SWAYAM: free online courses', description: 'National platform for free online courses.', url: 'https://swayam.gov.in/', tags: ['course'] });
add({ type: 'worksheet', level: '10', subjectName: 'Science', provider: 'Virtual Labs', featured: true, title: 'Virtual Labs: do science experiments online', description: 'Simulated lab experiments for practice and revision.', url: 'https://www.vlab.co.in', tags: ['practical', 'experiment', 'lab'] });
add({ type: 'notes', level: '10', subjectName: 'Social Science', provider: 'NIOS', board: 'NIOS', title: 'NIOS secondary course study material (Class 10 level)', description: 'Open-schooling study material from the National Institute of Open Schooling.', url: 'https://www.nios.ac.in/', tags: ['nios'] });
add({ type: 'notes', level: '12', subjectName: 'Economics', provider: 'NIOS', board: 'NIOS', title: 'NIOS senior secondary study material (Class 12 level)', description: 'Open-schooling study material from the National Institute of Open Schooling.', url: 'https://www.nios.ac.in/', tags: ['nios'] });
add({ type: 'book', level: '10', subjectName: 'Mathematics', provider: 'ePathshala', board: 'NCERT', title: 'ePathshala: NCERT books and e-content', description: 'NCERT e-books and learning content in a mobile-friendly format.', url: 'https://epathshala.nic.in/', tags: ['ebook'] });
add({ type: 'notes', level: '10', subjectName: 'Science', provider: 'NDLI', featured: true, title: 'NDLI School Education: browse by board, subject and language', description: 'National Digital Library of India, School Education section.', url: 'https://www.ndl.gov.in/ndl_se', tags: ['library'] });
add({ type: 'paper', level: 'NEET', subjectName: 'Biology', board: 'NTA', provider: 'NTA', title: 'NEET (UG): papers and information bulletin', description: 'Official exam information and previous papers from the National Testing Agency.', url: 'https://nta.ac.in/', tags: ['neet'] });
add({ type: 'paper', level: 'UPSC', subjectName: 'General Studies', board: 'UPSC', provider: 'UPSC', title: 'UPSC: previous question papers', description: 'Official previous question papers from the Union Public Service Commission.', url: 'https://upsc.gov.in/examinations/previous-question-papers', tags: ['upsc'] });
for (const sub of ['Physics', 'Chemistry', 'Mathematics']) {
  add({ type: 'notes', level: 'JEE', subjectName: sub, board: 'NTA', provider: 'NTA', featured: sub === 'Physics', title: `JEE Main official syllabus and information: ${sub}`,
    description: 'Official JEE Main syllabus, information bulletin and notices from the National Testing Agency.', url: 'https://jeemain.nta.ac.in/', tags: ['jee main', 'syllabus', sub.toLowerCase()] });
  add({ type: 'paper', level: 'JEE', subjectName: sub, board: 'NTA', provider: 'NTA', title: `JEE Main previous question papers: ${sub}`,
    description: 'Question papers and answer keys published by NTA.', url: 'https://jeemain.nta.ac.in/', tags: ['jee main', 'previous year', sub.toLowerCase()] });
  add({ type: 'book', level: 'JEE', subjectName: sub, board: 'NCERT', provider: 'NCERT', title: `NCERT ${sub} textbooks, Class 11 and 12 (the base of JEE Main)`,
    description: 'JEE Main is based on the NCERT Class 11 and 12 syllabus. On the NCERT page choose Class 11 and Class 12.', url: NCERT, tags: ['ncert', 'jee main', sub.toLowerCase()] });
}
await Resource.insertMany(res);

const mcq = (chapter, subject, difficulty, text, options, answerIndex, explanation, extra = {}) =>
  ({ chapter: chapter._id, subject: subject._id, type: 'mcq', difficulty, text, options, answerIndex, explanation, ...extra });

await Question.insertMany([
  mcq(life, sci10, 'easy', 'Which organ absorbs most of the digested food in humans?', ['Stomach', 'Small intestine', 'Large intestine', 'Oesophagus'], 1, 'The inner wall of the small intestine has villi that greatly increase surface area for absorption.'),
  mcq(life, sci10, 'easy', 'The end product of aerobic respiration of glucose is:', ['Ethanol + CO2', 'Lactic acid', 'CO2 + water + energy', 'Pyruvate'], 2, 'With oxygen, pyruvate is fully broken down to CO2 and water, releasing energy.'),
  mcq(life, sci10, 'medium', 'Which blood vessel carries oxygenated blood from the lungs to the heart?', ['Pulmonary artery', 'Pulmonary vein', 'Vena cava', 'Aorta'], 1, 'The pulmonary vein is the exception: it carries oxygenated blood.'),
  mcq(life, sci10, 'medium', 'Which of these is NOT a function of the kidney?', ['Filtering blood', 'Making urine', 'Producing bile', 'Balancing water and salts'], 2, 'Bile is produced by the liver.'),
  mcq(life, sci10, 'hard', 'Anaerobic respiration in muscle cells during heavy exercise produces:', ['Ethanol', 'Lactic acid', 'Acetic acid', 'Glycerol'], 1, 'Muscles convert pyruvate to lactic acid when oxygen is short; build-up causes cramps.'),
  { chapter: life._id, subject: sci10._id, type: 'short', difficulty: 'easy', text: 'Why are villi present in the small intestine?',
    answerText: 'Villi are finger-like projections that increase the surface area for absorption of digested food.', explanation: 'Larger surface area means faster absorption into blood vessels in the villi.' },
  { chapter: life._id, subject: sci10._id, type: 'long', difficulty: 'medium', text: 'Describe the path of blood in the human heart with a labelled diagram.',
    answerText: 'Deoxygenated blood: body -> right atrium -> right ventricle -> lungs (pulmonary artery). Oxygenated blood: lungs -> left atrium -> left ventricle -> body (aorta).',
    explanation: 'Draw four chambers, label valves, and mark the flow with arrows. Add your own diagram image URL in diagramUrl.' },

  mcq(quad, math10, 'easy', 'The roots of x^2 - 5x + 6 = 0 are:', ['2 and 3', '-2 and -3', '1 and 6', '-1 and -6'], 0, 'Factorise: (x - 2)(x - 3) = 0, so x = 2 or 3.'),
  mcq(quad, math10, 'medium', 'The discriminant of 2x^2 - 4x + 3 = 0 is:', ['-8', '8', '16', '-16'], 0, 'D = b^2 - 4ac = 16 - 24 = -8, so no real roots.'),
  mcq(quad, math10, 'hard', 'For what value of k does x^2 + kx + 9 = 0 have equal roots (k > 0)?', ['3', '6', '9', '12'], 1, 'Equal roots need D = 0: k^2 - 36 = 0, so k = 6.'),
  { chapter: quad._id, subject: math10._id, type: 'short', difficulty: 'medium', text: 'Solve 2x^2 - 7x + 3 = 0.',
    answerText: 'x = 3 or x = 1/2', explanation: 'Split the middle term: 2x^2 - 6x - x + 3 = 2x(x - 3) - 1(x - 3) = (2x - 1)(x - 3).' },

  mcq(repro, bio12, 'medium', 'Double fertilisation is a feature of:', ['Gymnosperms', 'Angiosperms', 'Bryophytes', 'Pteridophytes'], 1, 'In angiosperms, one sperm fuses with the egg and the other with the two polar nuclei.'),
]);

console.log('Seeded sample data.');
await mongoose.disconnect();
