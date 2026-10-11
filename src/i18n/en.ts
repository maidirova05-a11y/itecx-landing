import type { Content } from './ru'

/** English translation — same structure as ru.ts, enforced by the Content type. */
export const en: Content = {
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Formats', href: '#formats' },
    { label: 'Stages', href: '#stages' },
    { label: 'Italy', href: '#italy' },
    { label: 'Guide', href: '/en/guide' },
    { label: 'FAQ', href: '#faq' },
  ],

  hero: {
    eyebrow: 'International scientific platform',
    title: 'ITECX — a congress in science, engineering, and mathematics',
    subtitle:
      'Research by school students, university students, and scientists — from the school stage to the international final in Italy.',
    ctaPrimary: 'About the congress',
    ctaSecondary: 'Final in Italy',
  },

  about: {
    kicker: 'About the congress',
    title: 'The First Fibonacci International Congress on Engineering, Technology, and Mathematics',
    fullName: 'Known as ITECX',
    text: 'A scientific platform where school students, university students, and teachers present their research, join discussions, and meet like-minded people from universities around the world.',
  },

  mission: {
    kicker: 'Mission',
    title: 'Raising a generation of researchers ready to offer world-class solutions',
    items: [
      {
        title: 'Research skills',
        text: 'Research, project work, and scientific writing guided by mentors.',
      },
      {
        title: 'International exchange',
        text: 'Meeting scientists and students from other countries and presenting in English.',
      },
      {
        title: 'Innovation in education',
        text: 'Projects that bring new technology into learning.',
      },
    ],
  },

  formats: {
    kicker: 'Participation formats',
    title: 'Two tracks — one scientific standard',
    categoriesLabel: 'Fields',
    categories: ['Educational technology', 'Science', 'Mathematics', 'Engineering'],
    tracks: [
      {
        name: 'ITECX college',
        audience: 'School students, grades 3–11',
        text: 'Present their research papers and projects.',
        path: ['School stage', 'National congress', 'Final in Italy'],
      },
      {
        name: 'ITECX academic',
        audience: 'University students, lecturers, and professors',
        text: 'Give research talks and share their work with the academic community.',
        path: ['National congress', 'Final in Italy'],
      },
    ],
  },

  stages: {
    kicker: 'Stages',
    title: 'A project’s path from school to Italy',
    items: [
      {
        step: '01',
        title: 'School stage',
        text: 'Each school holds its own congress. A jury of teachers selects the best projects.',
      },
      {
        step: '02',
        title: 'National congress',
        text: 'A jury of educators and scientists evaluates the work. The best projects advance to the international final.',
      },
      {
        step: '03',
        title: 'Final in Italy',
        text: 'A talk and a poster in English before scientists and students from many countries.',
      },
    ],
    note: 'At every stage, teachers and mentors help with research, data collection, and scientific writing.',
  },

  italyStage: {
    kicker: 'International stage',
    title: 'The final takes place in Italy',
    text: 'Projects that pass the national selection are invited to Italy. An extended jury evaluates them against academic standards.',
    publicationTitle: 'Publication in Fibonacci',
    publication:
      'The best works of the final are considered for publication in the indexed scientific journal Fibonacci.',
  },

  requirements: {
    kicker: 'Requirements',
    title: 'What participants prepare',
    items: [
      {
        value: '4',
        unit: 'sections',
        title: 'Research paper',
        text: 'Introduction, methodology, results, and conclusions.',
      },
      {
        value: '10',
        unit: 'min',
        title: 'Oral talk',
        text: 'A presentation to the jury in an academic format.',
      },
      {
        value: '5',
        unit: 'min',
        title: 'Poster',
        text: 'A poster defense with visual materials.',
      },
    ],
    rules: [
      {
        title: 'Language',
        text: 'Your native language at the national stage, English at the international one.',
      },
      {
        title: 'Originality',
        text: 'Your own work only, free of plagiarism, with all citations properly formatted.',
      },
    ],
  },

  criteria: {
    kicker: 'Criteria',
    title: 'How projects are evaluated',
    intro: 'The jury evaluates every work against six objective criteria.',
    items: [
      { title: 'Scientific depth', text: 'Hypothesis, data analysis, and reliability of results.', aspects: ['Hypothesis formulation', 'Data analysis', 'Reliability of results'] },
      { title: 'Innovation', text: 'A creative approach and use of new technology.', aspects: ['Innovative approach', 'New technologies'] },
      { title: 'Contribution to education', text: 'How applicable the results are to learning.', aspects: [] },
      { title: 'Research methods', text: 'How sound and reliable the chosen methods are.', aspects: [] },
      { title: 'Presentation', text: 'Clarity and persuasiveness of the talk.', aspects: [] },
      { title: 'Research paper', text: 'Structure, writing quality, and compliance with academic standards.', aspects: [] },
    ],
  },

  projectJourney: {
    kicker: 'How to build a project',
    title: '12 steps to a finished work',
    phases: [
      {
        title: 'Research',
        steps: [
          { title: 'Choosing a topic', hint: 'A question you care about and can actually test.' },
          { title: 'Formulating a hypothesis', hint: 'An assumption your research will confirm or refute.' },
          { title: 'Choosing a methodology', hint: 'Experiment, survey, modeling, or calculation — whatever fits the task.' },
          { title: 'Conducting research', hint: 'Follow the plan and record every step.' },
          { title: 'Collecting data', hint: 'The measurements and observations your conclusions rest on.' },
          { title: 'Analyzing data', hint: 'Process the results: tables, charts, statistics.' },
        ],
      },
      {
        title: 'Research paper',
        steps: [
          { title: 'Drawing conclusions', hint: 'Answer the original question: was the hypothesis confirmed?' },
          { title: 'Writing the research paper', hint: 'Introduction, methodology, results, and conclusions.' },
          { title: 'Getting feedback', hint: 'Show the work to your mentor and address the comments.' },
        ],
      },
      {
        title: 'Defense',
        steps: [
          { title: 'Preparing the presentation', hint: 'A talk of up to 10 minutes with a clear structure.' },
          { title: 'Preparing the poster', hint: 'A visual board for the five-minute defense.' },
          { title: 'Submitting the application', hint: 'Register for the congress through the form on the site.' },
        ],
      },
    ],
  },

  guideTeaser: {
    kicker: 'Participant guide',
    title: 'How to build a project — and how it’s judged',
    text: '12 steps from choosing a topic to applying and the jury’s 6 criteria — on a separate page.',
    cta: 'Open the guide',
  },

  guide: {
    kicker: 'Participant guide',
    title: 'How to build a project — and how it’s judged',
    lead: '12 steps from idea to application and the 6 criteria the jury uses.',
    stepsLink: 'Steps',
    criteriaLink: 'Criteria',
    phaseLabel: 'Phase',
    ctaTitle: 'Project ready?',
    ctaText: 'Register — the organizers will tell you about the upcoming stage.',
    seo: {
      title: 'Participant guide — ITECX',
      description: 'How to prepare a research project for the ITECX congress: 12 steps from choosing a topic to applying, and the 6 criteria the jury uses.',
    },
  },

  faq: {
    kicker: 'FAQ',
    title: 'The essentials, briefly',
    subtitle: 'Answers to the questions participants and teachers ask most often.',
    items: [
      {
        q: 'Who can take part in the ITECX congress?',
        a: 'ITECX college is for school students in grades 3–11, ITECX academic is for university students, lecturers, and professors. The fields are shared: educational technology, science, mathematics, and engineering.',
      },
      {
        q: 'What stages does the congress consist of?',
        a: 'For school students: the school stage, the national congress, and the international final in Italy. The academic format starts directly at the national stage.',
      },
      {
        q: 'Which language should I present in?',
        a: 'Your native language at the national stage, English at the international final.',
      },
      {
        q: 'What does a participant need to prepare?',
        a: 'A research paper with four sections (introduction, methodology, results, conclusions), an oral talk of up to 10 minutes, and a poster — its defense takes 5 minutes.',
      },
      {
        q: 'How are projects evaluated?',
        a: 'Scientific depth, innovation, contribution to education, research methods, presentation skills, and the quality of the research paper.',
      },
      {
        q: 'What do participants gain?',
        a: 'The best works of the final are considered for publication in the indexed Fibonacci scientific journal. Participants also gain experience in academic discussion and meet researchers from other countries.',
      },
      {
        q: 'How do I apply?',
        a: 'Click “Register” — it opens the registration form. The organizers will get in touch and explain the upcoming stage and deadlines.',
      },
    ],
  },

  apply: {
    kicker: 'Registration',
    title: 'Ready to present your project?',
    subtitle: 'Registration takes a couple of minutes.',
    cta: 'Register',
    consentBefore: 'By registering, you agree to the ',
    consentLink: 'privacy policy',
    consentAfter: '.',
  },

  footer: {
    name: 'ITECX',
    tagline: 'ITECX — a congress in science, engineering, and mathematics',
  },

  privacy: {
    backHome: 'Back to home',
    kicker: 'Legal information',
    title: 'Privacy Policy',
    updatedLabel: 'Updated',
    updatedDate: 'August 17, 2026',
    intro:
      'This document explains in plain language what data a visitor to itecx.kz leaves behind, why the ITECX organizers need it, and what you can do about it.',
    tocTitle: 'Contents',
    sections: [
      {
        id: 'general',
        title: 'General provisions',
        paragraphs: [
          'itecx.kz is the official website of the ITECX congress (First Fibonacci International Congress on Engineering, Technology, and Mathematics) in Kazakhstan. Here we present the congress and accept applications to take part.',
          'We process personal data in line with the Law of the Republic of Kazakhstan “On Personal Data and Its Protection”. By submitting the application form you consent to the processing of the data it contains on the terms of this document.',
          'If you disagree with anything below, simply do not submit the form — you can read about the congress without it.',
        ],
        items: [],
      },
      {
        id: 'data',
        title: 'What data we collect',
        paragraphs: [
          'You give us every piece of data yourself, through the “Submit your application” form. We ask only for what is needed to contact a participant and determine their format:',
        ],
        items: [
          'first and last name',
          'email address',
          'phone number — optional',
          'participation format: ITECX college (grades 3–11) or ITECX academic (university students, lecturers, professors)',
          'school or university — optional',
          'a comment about your project — optional',
        ],
      },
      {
        id: 'technical',
        title: 'Technical data',
        paragraphs: [
          'When the form is submitted, the server briefly sees the sender’s IP address — it is used solely to cut off spam and automated submissions. The IP address is not stored in the applications database.',
          'We do not determine your location, do not build advertising profiles, and do not track you across other websites.',
        ],
        items: [],
      },
      {
        id: 'purpose',
        title: 'Why we need it',
        paragraphs: ['The data you leave is used only to work with your application:'],
        items: [
          'to contact you and answer your questions about the congress',
          'to determine the right format — ITECX college or ITECX academic',
          'to guide the participant through the school, national, and international stages',
          'to share organizational details: dates and requirements for the research paper, poster, and presentation',
          'to keep internal records of applications and anonymized statistics by region and institution',
        ],
      },
      {
        id: 'sharing',
        title: 'Who we share your data with',
        paragraphs: [
          'The full list of applications is visible only to the congress organizers — the panel is password-protected. Beyond them, data may reach:',
        ],
        items: [
          'services the website cannot run without (see “External services”) — only to the extent their work requires',
          'jury members and stage coordinators — only the part concerning your project',
          'the organizers of the international final in Italy — for participants who passed the national stage, and only the data needed for registration at the final and publication in the Fibonacci scientific journal',
          'state authorities — where the law of the Republic of Kazakhstan requires it',
        ],
      },
      {
        id: 'services',
        title: 'External services',
        paragraphs: ['The site relies on a few external services, and each of them sees only the necessary minimum:'],
        items: [
          'Google Fonts — loads the Inter and JetBrains Mono typefaces; in doing so your browser technically discloses your IP address to the service',
          'FormSubmit — mirrors each application as an email to the organizers so that none is lost',
          'Bitrix24 — the organizers’ CRM: an application arrives there as a contact and a deal for further work',
          'hosting and database — the website and the applications table physically live on their servers',
        ],
      },
      {
        id: 'cookies',
        title: 'Cookies',
        paragraphs: [
          'There are no advertising cookies on this site. Visit statistics are collected by Yandex.Metrica: it sets its own cookies and records, without identifying you, which pages were opened, navigation and on-page actions. You can turn it off by blocking cookies in your browser or with a content blocker.',
          'Besides that, technical values are kept in your browser storage:',
        ],
        items: [
          'the interface language you chose — so the right version opens on your next visit',
          'the time of your last submission — so the form cannot be resubmitted every second',
          'the organizer panel login token — for organizers only; it lives 12 hours and is erased when the tab is closed',
        ],
      },
      {
        id: 'retention',
        title: 'How long we keep it',
        paragraphs: [
          'Applications are kept for the duration of the current congress cycle and a reasonable period afterwards — for record-keeping and for inviting participants to the next season.',
          'As soon as the data is no longer needed, or you ask us to remove it, we delete the record from the database and from the CRM.',
        ],
        items: [],
      },
      {
        id: 'children',
        title: 'Children’s data',
        paragraphs: [
          'ITECX college is for school students from grade 3 to grade 11, so we treat their data with particular care.',
        ],
        items: [
          'an application for a minor is submitted by a parent, legal guardian, or a mentor teacher with their consent',
          'we ask only for a name, contacts, and the institution — nothing beyond that',
          'do not enter health information, national ID numbers, document numbers, or other sensitive details: they are not needed to take part',
        ],
      },
      {
        id: 'security',
        title: 'How your data is protected',
        paragraphs: ['We protect applications with technical measures rather than promises:'],
        items: [
          'the site runs over HTTPS only — the form travels through an encrypted channel',
          'every application is validated twice, in the browser and on the server, and database queries are parameterized',
          'submission rate is limited: no more than 10 applications per hour from one address and 5 per day per email',
          'the list of applications opens only after a password login; the password itself is never stored — only its hash — and the session expires after 12 hours',
          'a Content Security Policy and strict headers shield the site from embedding and third-party scripts',
        ],
      },
      {
        id: 'rights',
        title: 'What you can ask for',
        paragraphs: ['Regarding your own data, you have the right to:'],
        items: [
          'find out what data of yours we hold',
          'correct an inaccuracy',
          'delete your application',
          'withdraw your consent to processing',
        ],
      },
      {
        id: 'requests',
        title: 'How to send a request',
        paragraphs: [
          'An email to the address in the “Contacts” section is enough — sent from the address you used in the application. We reply within a reasonable time, usually a few working days.',
          'Withdrawing consent means we stop processing the data — taking part in the congress through the website will no longer be possible.',
        ],
        items: [],
      },
      {
        id: 'updates',
        title: 'Updates to this document',
        paragraphs: [
          'This policy may change — for instance, if a new service or participation format appears. The current version always lives at this address, and the date of the last update is shown at the top of the page.',
          'We try to announce material changes in advance: on the website or by email to those who submitted an application.',
        ],
        items: [],
      },
    ],
    contacts: {
      title: 'Contacts',
      text: 'Write to the congress organizers — we will answer any question about your data and correct or delete it on request.',
      emailLabel: 'Email',
      email: 'info@az-group.kz',
      siteLabel: 'Website',
      site: 'itecx.kz',
    },
    rights: '© 2026 ITECX Kazakhstan. All rights reserved.',
    seo: {
      title: 'Privacy Policy — ITECX',
      description:
        'How the ITECX congress handles personal data submitted through the application form on itecx.kz: what we collect, why, who we share it with, how long we keep it, and how to have it deleted.',
    },
  },

  ui: {
    skipLink: 'Skip to content',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    mainNavAria: 'Main navigation',
    footerNavAria: 'Footer navigation',
    langAria: 'Language selection',
    applyCta: 'Register',
    privacyLink: 'Privacy Policy',
  },

  seo: {
    ogLocale: 'en_US',
    title: 'ITECX — International Scientific Congress',
    description:
      'ITECX — an international congress in science, engineering and mathematics. School and national stages, an international final in Italy, and publication in the Fibonacci scientific journal.',
    keywords:
      'ITECX, scientific congress, science, engineering, mathematics, Kazakhstan, Fibonacci, student congress, international congress, Italy, research paper',
  },
}
