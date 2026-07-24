import type { Content } from './ru'

/** English translation — same structure as ru.ts, enforced by the Content type. */
export const en: Content = {
  nav: [
    { label: 'About', href: '#about' },
    { label: 'Participation formats', href: '#formats' },
    { label: 'Congress stages', href: '#stages' },
    { label: 'Criteria', href: '#criteria' },
    { label: 'International stage', href: '#italy' },
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
  },

  footer: {
    name: 'ITECX',
    tagline: 'ITECX — a congress in science, engineering, and mathematics',
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
