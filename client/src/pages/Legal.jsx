import { Link } from 'react-router-dom';
import { SITE, hasPlaceholders } from '../site.js';

const NAV = [['terms', 'Terms and Conditions'], ['privacy', 'Privacy Policy'], ['disclaimer', 'Disclaimer']];

function Terms() {
  return (
    <>
      <p>These Terms and Conditions ("Terms") apply to your use of {SITE.name}, including our website and everything on it ("the Service"). The Service is run by {SITE.company} ("we", "us"). By creating an account or using the Service, you agree to these Terms. If you do not agree, please do not use the Service.</p>

      <h2>Who can use {SITE.name}</h2>
      <p>The Service is made for students of Class 9 to 12 and for those preparing for entrance exams such as JEE Main, NEET and UPSC. If you are under 18, you may use the Service only with the permission and supervision of your parent or legal guardian. By allowing you to create an account, your parent or guardian agrees to these Terms on your behalf. A parent or guardian can write to us at any time to review or delete a child's account.</p>

      <h2>Your account</h2>
      <ul>
        <li>Give correct information when you sign up and keep it up to date.</li>
        <li>Keep your password secret. You are responsible for what happens under your account.</li>
        <li>Tell us at {SITE.email} if you think someone else has used your account.</li>
        <li>One person should use one account. Do not share your account with others.</li>
      </ul>

      <h2>What the Service provides</h2>
      <p>The Service offers a library of links to study material (such as textbooks, notes, question papers and videos), chapter quizzes, a practice-paper maker, an AI teacher and a "My library" area where you can save items. We may add, change or remove features at any time.</p>

      <h2>Third-party material and links</h2>
      <p>Most library items are links to websites run by other organisations, for example NCERT, CBSE, NIOS, NTA, DIKSHA and SWAYAM. We do not own or host that material. Each publisher is responsible for the accuracy, availability and legality of its content, and the publisher's own terms apply when you open it. A link on our site does not mean we are connected with, or endorsed by, the publisher.</p>

      <h2>Practice questions, notes and papers</h2>
      <p>The questions, notes and practice papers created on {SITE.name} are for practice and revision. They may contain mistakes. Please check important facts against your textbook or your teacher. Unless a page clearly says so, practice papers are not official papers of CBSE, NCERT, NTA, UPSC or any other body.</p>

      <h2>AI teacher</h2>
      <p>The AI teacher creates answers using artificial intelligence. Its answers can be incomplete or wrong, so please verify them with your textbook or teacher before relying on them for exams. Do not type personal details such as your phone number, address, school ID or any government ID into the AI teacher. We may limit how much each person can use it.</p>

      <h2>Using the Service properly</h2>
      <p>You agree not to:</p>
      <ul>
        <li>break any law or use the Service to harass, threaten or harm anyone;</li>
        <li>try to hack, overload, scrape in bulk, or get around limits or security on the Service;</li>
        <li>upload or share viruses or harmful code;</li>
        <li>pretend to be another person;</li>
        <li>use the AI teacher to produce harmful, hateful or illegal content, or to cheat in a live exam;</li>
        <li>copy, sell or republish our notes, questions or design without our written permission.</li>
      </ul>

      <h2>Our content and your use of it</h2>
      <p>The design, software, notes and questions created for {SITE.name} belong to us or our licensors. You may use them for your own personal, non-commercial study. Rights in third-party material stay with their owners.</p>

      <h2>Copyright complaints</h2>
      <p>If you believe a link or item on the Service infringes your copyright, please email {SITE.email} with: the name of the work, the page address on our site where you found it, proof that you own the rights or act for the owner, and your contact details. We will review the complaint promptly and remove or disable access where appropriate.</p>

      <h2>No promise of results</h2>
      <p>We work to help you study, but we cannot promise any marks, rank, admission or job. Your results depend on many things outside our control.</p>

      <h2>Changes, suspension and ending your account</h2>
      <p>We may suspend or close an account that breaks these Terms or puts the Service or other users at risk. You can stop using the Service at any time and may ask us to delete your account.</p>

      <h2>Service "as is" and limits on our responsibility</h2>
      <p>The Service is provided "as is" and "as available". We do not promise that it will always be free of errors or interruptions. To the extent the law allows, we are not responsible for indirect or consequential loss, or for loss caused by third-party websites or by relying on practice material or AI answers. To the extent the law allows, our total responsibility for any claim is limited to the amount you paid us for the Service in the last 12 months, if any. Nothing in these Terms limits rights you have under law that cannot be limited.</p>

      <h2>Governing law</h2>
      <p>These Terms are governed by the laws of India. Courts in {SITE.city} will have jurisdiction, subject to any rights you have under law.</p>

      <h2>Changes to these Terms</h2>
      <p>We may update these Terms from time to time. We will post the new version here with a new date, and tell you about important changes. If you keep using the Service after a change, you accept the updated Terms.</p>

      <h2>Contact</h2>
      <p>{SITE.company}, {SITE.address}. Email: {SITE.email}.</p>
    </>
  );
}

function Privacy() {
  return (
    <>
      <p>This Privacy Policy explains what personal data {SITE.company} ("we", "us") collects through {SITE.name}, why we collect it, and the choices you have. Many of our users are children, so we try to collect as little as possible.</p>

      <h2>What we collect</h2>
      <ul>
        <li><b>Account details:</b> your name, email address, the class or exam you are preparing for, and your password. Passwords are stored in a scrambled (hashed) form that we cannot read.</li>
        <li><b>Your activity:</b> quiz attempts and scores, resources you save, and the questions you type into the AI teacher.</li>
        <li><b>Technical data:</b> your IP address, browser and device type, and server logs, used for security and to stop abuse.</li>
        <li><b>Stored on your own device:</b> a login token and a "recently viewed" list, kept in your browser's local storage.</li>
      </ul>
      <p>We do not ask for your phone number, home address, Aadhaar or other government ID, or payment details. Please do not type them into the AI teacher.</p>

      <h2>Why we use it</h2>
      <ul>
        <li>to create and run your account and show your saved items and scores;</li>
        <li>to answer your questions through the AI teacher;</li>
        <li>to keep the Service secure and prevent misuse;</li>
        <li>to understand which resources are used, using counts and totals, so we can improve the library;</li>
        <li>to meet legal duties.</li>
      </ul>
      <p>We use your data based on the consent you give when you sign up. You can withdraw consent at any time by deleting your account (see "Your rights"). We send you messages only about the Service itself, and we do not send marketing without separate consent.</p>

      <h2>Children and parents</h2>
      <p>If you are under 18, your parent or guardian must allow you to use {SITE.name}. When you sign up, you confirm that they have done so. We do not show advertising on the Service, and we do not track or profile children's behaviour for advertising. A parent or guardian can email us to see, correct or delete their child's data.</p>

      <h2>Who we share data with</h2>
      <p>We do not sell your personal data. We share it only with service providers who help us run the Service, under suitable safeguards:</p>
      <ul>
        <li>our hosting and database providers, who store the data;</li>
        <li>our AI provider: the questions you type into the AI teacher are sent to it so it can write an answer;</li>
        <li>authorities, when the law requires us to.</li>
      </ul>
      <p>Our providers may process data on servers in India or in other countries.</p>

      <h2>How long we keep data</h2>
      <p>We keep your account data until you delete your account. Security logs are kept for a short period (up to 90 days) and then deleted. After you delete your account we remove your personal data, except where the law requires us to keep it.</p>

      <h2>Keeping data safe</h2>
      <p>We use passwords that are stored hashed, secure connections, and limits on who can access the data. No online service is completely risk-free. If you notice anything suspicious, please write to us.</p>

      <h2>Cookies and local storage</h2>
      <p>We use your browser's local storage only to keep you logged in and to remember what you viewed recently. We do not use advertising or tracking cookies. You can clear this at any time from your browser settings, or by logging out.</p>

      <h2>Your rights</h2>
      <p>You can ask us to: tell you what personal data we hold about you; correct it; delete it; or withdraw your consent. You can also make a complaint about how we handle your data. Email {SITE.email} and we will respond within a reasonable time and as the law requires. You may also be able to complain to the Data Protection Board of India under the Digital Personal Data Protection Act, 2023 and its rules, once that route is available.</p>

      <h2>Grievance Officer</h2>
      <p>{SITE.grievanceOfficer}, {SITE.company}, {SITE.address}. Email: {SITE.email}.</p>

      <h2>Changes to this policy</h2>
      <p>We may update this policy. We will post the new version here with a new date, and tell you about important changes.</p>
    </>
  );
}

function Disclaimer() {
  return (
    <>
      <h2>For study only</h2>
      <p>{SITE.name} is a study aid. Everything on it, including notes, quizzes, practice papers and AI answers, is meant to support your learning and is not a substitute for your textbooks, your school or your teachers.</p>

      <h2>Links to other websites</h2>
      <p>Library items usually open on a website run by someone else. We try to link to official sources, but we do not control those sites and cannot promise that a link will always work or that the content is current, complete or correct. Syllabi, textbooks and exam rules change; please confirm the latest details with the official source (for example NCERT, CBSE, NTA or UPSC).</p>

      <h2>No affiliation</h2>
      <p>{SITE.name} is an independent website. It is not affiliated with, endorsed by, or sponsored by NCERT, CBSE, NTA, UPSC, NIOS, DIKSHA, SWAYAM or any other organisation we link to. Their names are used only to describe where material comes from, and belong to their owners.</p>

      <h2>AI answers</h2>
      <p>AI answers may be wrong or out of date. Always check them against your textbook or teacher.</p>

      <h2>No guarantee of results</h2>
      <p>We cannot guarantee any exam score, rank or admission.</p>

      <h2>Report a problem</h2>
      <p>Found a wrong answer, a broken link or something that should not be here? Please email {SITE.email} and we will look into it.</p>
    </>
  );
}

const DOCS = {
  terms: { title: 'Terms and Conditions', body: <Terms /> },
  privacy: { title: 'Privacy Policy', body: <Privacy /> },
  disclaimer: { title: 'Disclaimer', body: <Disclaimer /> },
};

export default function Legal({ doc }) {
  const d = DOCS[doc];
  return (
    <div className="sheet legal">
      <nav className="legalnav" aria-label="Legal pages">
        {NAV.map(([id, label]) => <Link key={id} to={'/' + id} className={'chip' + (id === doc ? ' on' : '')}>{label}</Link>)}
      </nav>
      {hasPlaceholders && (
        <div className="draftbox" role="note">
          <b>Draft for the site owner.</b> Fill in the details in <code>client/src/site.js</code> (anything in [square brackets]) and have a lawyer review these pages before you launch. This notice disappears once all placeholders are replaced.
        </div>
      )}
      <h1>{d.title}</h1>
      <p className="empty">Last updated: {SITE.lastUpdated}</p>
      {d.body}
    </div>
  );
}
