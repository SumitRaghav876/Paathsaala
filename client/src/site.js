// Edit this file once. The Terms, Privacy Policy, Disclaimer and footer all read from it.
// Anything in [square brackets] is a placeholder: replace it before you launch.
export const SITE = {
  name: 'Paathshala',
  tagline: 'Study material, quizzes and an AI teacher for Class 9 to 12, JEE and NEET.',
  company: 'Digital Paathsala',
  email: 'raghavsumitkr@gmail.com',
  address: 'Sector 88 Greater Noida, India',
  city: 'Greater Noida',
  grievanceOfficer: 'Dhruv Raghav',
  lastUpdated: '9 October 2026',
  termsVersion: '2026-10-09', // change this when you change the Terms; it is saved with each sign-up
};

export const hasPlaceholders = Object.values(SITE).some((v) => String(v).includes('['));
