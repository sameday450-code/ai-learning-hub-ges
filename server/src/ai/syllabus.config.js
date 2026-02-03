/**
 * Ghana Education Service (GES) Syllabus Configuration
 * Aligned to JHS and SHS curriculum requirements
 */

export const GES_SYLLABUS = {
  // Junior High School (JHS)
  JHS: {
    MATHEMATICS: {
      code: 'MATH',
      topics: [
        'Numbers and Numeration',
        'Basic Operations',
        'Fractions, Decimals, and Percentages',
        'Ratio and Proportion',
        'Algebraic Expressions',
        'Simple Equations',
        'Geometry (Shapes and Angles)',
        'Mensuration (Area and Perimeter)',
        'Statistics and Probability',
        'Sets and Venn Diagrams'
      ],
      difficulty: 'foundational'
    },
    ENGLISH: {
      code: 'ENG',
      topics: [
        'Grammar and Usage',
        'Comprehension',
        'Composition Writing',
        'Vocabulary Development',
        'Parts of Speech',
        'Tenses',
        'Sentence Structure',
        'Reading Skills',
        'Writing Skills',
        'Listening and Speaking'
      ],
      difficulty: 'foundational'
    },
    SOCIAL_STUDIES: {
      code: 'SOC',
      topics: [
        'Ghana History',
        'Government and Politics',
        'Geography of Ghana',
        'Citizenship Education',
        'Economic Activities',
        'Culture and Traditions',
        'Map Reading',
        'Environmental Studies',
        'West African History',
        'World Geography'
      ],
      difficulty: 'foundational'
    },
    SCIENCE: {
      code: 'SCI',
      topics: [
        'Living and Non-living Things',
        'Human Body Systems',
        'Plants and Animals',
        'Matter and Energy',
        'Forces and Motion',
        'Electricity and Magnetism',
        'The Solar System',
        'Acids and Bases',
        'Scientific Method',
        'Environmental Science'
      ],
      difficulty: 'foundational'
    }
  },

  // Senior High School (SHS)
  SHS: {
    MATHEMATICS: {
      code: 'MATH',
      topics: [
        'Algebra and Functions',
        'Quadratic Equations',
        'Trigonometry',
        'Coordinate Geometry',
        'Vectors',
        'Calculus (Differentiation)',
        'Calculus (Integration)',
        'Statistics',
        'Probability',
        'Matrices and Determinants',
        'Sequences and Series'
      ],
      difficulty: 'advanced'
    },
    ENGLISH: {
      code: 'ENG',
      topics: [
        'Literature (Poetry)',
        'Literature (Drama)',
        'Literature (Prose)',
        'Essay Writing',
        'Comprehension',
        'Summary Writing',
        'Letter Writing',
        'Grammar and Syntax',
        'Oral English',
        'Vocabulary Development'
      ],
      difficulty: 'advanced'
    },
    SOCIAL_STUDIES: {
      code: 'SOC',
      topics: [
        'Government Systems',
        'Democracy and Governance',
        'International Relations',
        'Economic Development',
        'Human Rights',
        'Social Issues',
        'Political Systems',
        'Ghana Constitution',
        'Global Affairs',
        'Citizenship Responsibilities'
      ],
      difficulty: 'advanced'
    },
    COMPUTING: {
      code: 'COM',
      topics: [
        'Introduction to Computing',
        'Computer Hardware',
        'Computer Software',
        'Programming Basics',
        'Algorithms and Logic',
        'Data Representation',
        'Networking',
        'Database Management',
        'Web Development',
        'Cybersecurity'
      ],
      difficulty: 'advanced'
    }
  }
};

/**
 * Get syllabus for a specific level and subject
 */
export const getSyllabus = (level, subject) => {
  const levelUpper = level.toUpperCase();
  const subjectUpper = subject.toUpperCase().replace(/\s+/g, '_');
  
  return GES_SYLLABUS[levelUpper]?.[subjectUpper] || null;
};

/**
 * Validate if topic is in syllabus
 */
export const isValidTopic = (level, subject, topic) => {
  const syllabus = getSyllabus(level, subject);
  if (!syllabus) return false;
  
  return syllabus.topics.some(t => 
    t.toLowerCase().includes(topic.toLowerCase())
  );
};

/**
 * Get exam-specific guidelines
 */
export const EXAM_GUIDELINES = {
  BECE: {
    name: 'Basic Education Certificate Examination',
    level: 'JHS',
    format: 'Multiple choice and essay',
    tips: [
      'Show all working steps clearly',
      'Use simple, clear language',
      'Answer in complete sentences',
      'Check calculations twice'
    ]
  },
  WASSCE: {
    name: 'West African Senior School Certificate Examination',
    level: 'SHS',
    format: 'Theory and practical',
    tips: [
      'Provide detailed explanations',
      'Use technical terminology correctly',
      'Show comprehensive working',
      'Relate to real-world applications'
    ]
  }
};
