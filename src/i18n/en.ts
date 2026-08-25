import type { Content } from './ru'

/** English translation — same structure as ru.ts, enforced by the Content type. */
export const en: Content = {
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Participation formats', href: '#formats' },
    { label: 'Congress stages', href: '#stages' },
    { label: 'Criteria', href: '#criteria' },
    { label: 'International stage', href: '#italy' },
    { label: 'FAQ', href: '#faq' },
  ],

  hero: {
    eyebrow: 'International scientific platform',
    title: 'ITECX — a congress in science, engineering, and mathematics',
    subtitle:
      'Advancing fundamental and applied research in engineering, technology, and mathematics.',
    ctaPrimary: 'About the congress',
    ctaSecondary: 'International stage in Italy',
  },

  about: {
    kicker: 'About the congress',
    fullName:
      'ITECX is an abbreviation of First Fibonacci International Congress on Engineering, Technology, and Mathematics',
    description:
      'It is an international scientific platform dedicated to advancing fundamental and applied research in engineering, technology, and mathematics.',
    tracks: [
      { name: 'ITECX college', description: 'a congress for school students in grades 3–11' },
      { name: 'ITECX academic', description: 'a congress for university students, lecturers, and professors' },
    ],
    fill: ['Insightful talks', 'Engaging discussions', 'Networking opportunities'],
    closing:
      'A wide range of topics and innovative research is meant to inspire participants, fostering collaboration between universities and international scientific institutes. The congress encourages interdisciplinary research and brings together scientists from different fields.',
  },

  vision: {
    kicker: 'Vision & mission',
    visionTitle: 'Our vision',
    visionText:
      'The ITECX congress strives to develop young talent and working professionals in science, engineering, and mathematics — nurturing a generation of future leaders capable of proposing innovative solutions and strengthening global scientific collaboration.',
    missionTitle: 'Our mission',
    missionIntro:
      'ITECX builds an educational and communication platform that helps students and researchers to:',
    missionPoints: [
      'Refine research and project work skills',
      'Develop cross-cultural collaboration',
      'Shape scientific thinking at the international level',
    ],
    missionClosing:
      'The congress fosters knowledge exchange and unites the efforts of scientists from around the world.',
  },

  goals: {
    kicker: 'Congress goals',
    groups: [
      {
        title: 'Advancing science, technology, and innovation',
        points: [
          'Giving school students, teachers, and professors the opportunity to present their innovations and projects in science and technology on an academic platform',
          'Creating conditions for students to develop innovative projects in science, engineering, and mathematics',
          'Promoting new solutions through discussion of technology integration in education',
          'Encouraging students’ contribution to the development of educational technology and innovation',
        ],
      },
      {
        title: 'International exchange and collaboration',
        points: [
          'Opportunities for knowledge exchange and collaboration among students of different cultures worldwide',
          'Sustaining cross-cultural exchange of experience through the presentation of student projects at the global level',
        ],
      },
    ],
  },

  formats: {
    kicker: 'Participation formats',
    college: {
      name: 'ITECX college',
      age: 'grades 3–11',
      categories: ['Educational technology', 'science', 'mathematics', 'engineering'],
      participants: 'Present their research papers and projects',
      structure: ['School stage', 'National congress', 'International congress (Italy)'],
    },
    academic: {
      name: 'ITECX academic',
      age: 'university students, lecturers, professors',
      categories: ['Educational technology', 'science', 'mathematics', 'engineering'],
      participants:
        'Present their research reports and projects and share their work within the academic community',
      structure: ['National congress', 'International congress (Italy)'],
    },
  },

  stages: {
    kicker: 'Congress structure',
    items: [
      {
        step: '01',
        title: 'School stage',
        text: 'At the school stage, participants’ projects are evaluated and selected by a jury of school teachers for participation in the national (republican) congress. Participants must prepare their presentations or projects in a strictly defined format.',
      },
      {
        step: '02',
        title: 'National congress',
        text: 'Projects selected at the school congress are presented at the national level. These presentations are evaluated by a jury of educators and scientists. National projects will be considered for publication in a Fibonacci-indexed scientific journal, and successful papers will be presented on an international academic platform.',
      },
      {
        step: '03',
        title: 'International congress',
        text: 'Projects successfully presented at the national congress qualify for the international final, which will take place in Italy. Participants will present their projects to educators, scientists, and students from the scientific world, taking part in academic discussions. Presentations are judged both on scientific quality and on presentation skills. Each participant prepares a research paper and a poster suitable for a scientific congress.',
      },
    ],
  },

  italyStage: {
    kicker: 'International stage',
    title: 'The international congress takes place in Italy',
    text: 'Projects selected at the national level receive an invitation to Italy to take part in the international final. Works presented at national congresses are evaluated by an extended jury in accordance with academic standards.',
    publication:
      'Projects that succeed in the international final are considered for publication in the indexed scientific journal Fibonacci. This process gives students valuable experience in scientific publishing.',
  },

  format: {
    kicker: 'Format',
    items: [
      {
        title: 'Oral presentations',
        text: 'Research projects may be presented orally in an academic setting. Presentations are limited to 10 minutes.',
      },
      {
        title: 'Poster presentations',
        text: 'Presentations with visual materials and text explaining the essence of the project.',
      },
      {
        title: 'Research paper',
        text: 'Each student prepares a paper in the format of a research article stating the aim of the study, methods, results, and conclusions.',
      },
    ],
  },

  rules: {
    kicker: 'Terms and rules of participation',
    items: [
      {
        title: 'Language',
        text: 'At the national level, presentations and papers must be delivered in the native language. Participants admitted to the international congress must present in English.',
      },
      {
        title: 'Originality',
        text: 'Projects must be original and free of plagiarism. All citations must be properly formatted.',
      },
      {
        title: 'Presentation duration',
        text: 'Oral talks are limited to 10 minutes and poster presentations to 5 minutes.',
      },
      {
        title: 'Format',
        text: 'Projects must be formatted as a research article and include the following sections: Introduction, Methodology, Results, Conclusions.',
      },
    ],
  },

  criteria: {
    kicker: 'Evaluation criteria',
    intro:
      'Works submitted to the scientific congresses are evaluated against specific, objective criteria. The evaluation process considers factors such as scientific content, innovative approach, rigor of research methods, and presentation skills.',
    items: [
      {
        title: 'Scientific depth',
        text: 'Measures how academically developed the project is.',
        aspects: ['Hypothesis formulation', 'Data analysis', 'Reliability of results'],
      },
      {
        title: 'Innovation',
        text: 'Assesses the presence of creative ideas in the project.',
        aspects: ['Innovative approach', 'New technologies'],
      },
      {
        title: 'Contribution to education',
        text: 'Determines how the research supports the educational process and how applicable its results are to learning.',
        aspects: [],
      },
      {
        title: 'Research methods',
        text: 'The validity and reliability of the research methods used in the work.',
        aspects: [],
      },
      {
        title: 'Presentation skills',
        text: 'Presenting the work in an effective and clear manner.',
        aspects: [],
      },
      {
        title: 'Research paper',
        text: 'Prepared in accordance with research article standards. The format, quality of content, and compliance with academic requirements are evaluated.',
        aspects: [],
      },
    ],
  },

  process: {
    kicker: 'Congress process',
    items: [
      {
        step: '1',
        title: 'Preparation and organization',
        text: 'Teachers and mentors help students conduct research and prepare projects.',
        support: ['scientific writing', 'data collection', 'analysis of results'],
      },
      {
        step: '2',
        title: 'Organizing school congresses',
        text: 'Each school holds a scientific congress where students present and defend their projects. The best works advance to the national level.',
        support: [],
      },
      {
        step: '3',
        title: 'Holding national congresses',
        text: 'Projects selected at the national level receive an invitation to Italy for the international final. Works presented at national congresses are evaluated by an extended jury in accordance with academic standards.',
        support: [],
      },
      {
        step: '4',
        title: 'International congress and publication in Italy',
        text: 'Projects that succeed in the international final are considered for publication in the indexed scientific journal Fibonacci. This process gives students valuable experience in scientific publishing.',
        support: [],
      },
    ],
  },

  projectJourney: {
    kicker: 'Project creation guide',
    steps: [
      'Choosing a topic',
      'Conducting research',
      'Collecting data',
      'Choosing a methodology',
      'Formulating a hypothesis',
      'Analyzing data',
      'Drawing conclusions',
      'Writing the research paper',
      'Receiving feedback',
      'Preparing the presentation',
      'Preparing the poster',
      'Submitting the application',
    ],
  },

  faq: {
    kicker: 'FAQ',
    title: 'The essentials, briefly',
    subtitle: 'Answers to the questions participants and teachers ask most often.',
    items: [
      {
        q: 'Who can take part in the ITECX congress?',
        a: 'There are two formats. ITECX college is for school students from grade 3 to grade 11. ITECX academic is for university students, lecturers, and professors. The categories are the same: educational technology, science, mathematics, and engineering.',
      },
      {
        q: 'What stages does the congress consist of?',
        a: 'For school students there are three steps: the school stage, the national congress, and the international congress in Italy. The academic format has two stages — national and international.',
      },
      {
        q: 'Which language should I present in?',
        a: 'At the national level, presentations and papers are delivered in your native language. Participants admitted to the international congress present in English.',
      },
      {
        q: 'What does a participant need to prepare?',
        a: 'A research paper with Introduction, Methodology, Results, and Conclusions sections, plus an oral presentation of up to 10 minutes and a poster — poster sessions are limited to 5 minutes.',
      },
      {
        q: 'How are projects evaluated?',
        a: 'The jury looks at scientific depth, innovation, contribution to education, the soundness of the research methods, presentation skills, and whether the paper meets academic standards.',
      },
      {
        q: 'What do participants gain?',
        a: 'Projects that succeed at the international final are considered for publication in the indexed Fibonacci scientific journal. Participants also gain experience in academic discussion and connections with universities and researchers from other countries.',
      },
      {
        q: 'How do I apply?',
        a: 'Fill in the form on this page: name, contacts, and participation format. The organizers will get in touch and explain the upcoming stage and the timeline for preparing your work.',
      },
    ],
  },

  apply: {
    kicker: 'Application',
    title: 'Submit your application',
    subtitle: 'Fill in the form and the organizers will contact you.',
    firstName: 'First name',
    firstNamePlaceholder: 'Your first name',
    lastName: 'Last name',
    lastNamePlaceholder: 'Your last name',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    phone: 'Phone number',
    phonePlaceholder: '+7 700 000 00 00',
    invalidPhone: 'Please check the phone number',
    track: 'Participation format',
    trackPlaceholder: 'Choose a format',
    trackCollege: 'ITECX college (grades 3–11)',
    trackAcademic: 'ITECX academic (university students, lecturers, professors)',
    org: 'School / university',
    orgPlaceholder: 'Organization name',
    message: 'Comment (optional)',
    messagePlaceholder: 'Briefly about your project',
    submit: 'Submit application',
    sending: 'Sending…',
    success: 'Application sent! We will contact you.',
    error: 'Could not send. Please try again a bit later.',
    required: 'Please fill in the required fields',
    invalidEmail: 'Please check the email address',
    cooldown: 'Application already sent. You can retry in a minute.',
    consentBefore: 'By submitting the form you agree to our ',
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
          'There are no advertising or analytics cookies on this site. Only technical values are kept in your browser storage:',
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
    italyCta: 'International stage',
    applyCta: 'Apply now',
    earthFlag: 'Italy · world stage',
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
