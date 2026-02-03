import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JHS_SUBJECTS = [
  {
    name: 'MATHEMATICS',
    code: 'MATH',
    level: 'JHS',
    description: 'Numbers, Algebra, Geometry, Statistics and Problem Solving',
    syllabus: {
      topics: [
        'Number and Numeration',
        'Basic Operations',
        'Fractions, Decimals and Percentages',
        'Algebra - Simple Equations',
        'Geometry - Shapes, Angles, Area, Perimeter',
        'Statistics - Mean, Median, Mode',
        'Basic Probability',
        'Sets and Venn Diagrams'
      ]
    }
  },
  {
    name: 'ENGLISH',
    code: 'ENG',
    level: 'JHS',
    description: 'Grammar, Comprehension, Composition and Literature',
    syllabus: {
      topics: [
        'Grammar and Punctuation',
        'Reading Comprehension',
        'Essay Writing',
        'Vocabulary Building',
        'Literature (Stories, Poems)',
        'Oral English'
      ]
    }
  },
  {
    name: 'SOCIAL STUDIES',
    code: 'SOC',
    level: 'JHS',
    description: 'Geography, History, Civic Education and Economics',
    syllabus: {
      topics: [
        'Geography of Ghana',
        'Ghanaian Culture and Traditions',
        'Civic Education',
        'Economic Activities',
        'Environmental Studies',
        'Government and Politics'
      ]
    }
  },
  {
    name: 'HISTORY',
    code: 'HIST',
    level: 'JHS',
    description: 'Ghana and World History',
    syllabus: {
      topics: [
        'Ancient Ghana, Mali, Songhai Empires',
        'Trans-Saharan Trade',
        'European Contact and Trade',
        'Colonial Period',
        'Independence Movements'
      ]
    }
  },
  {
    name: 'CREATIVE ARTS',
    code: 'CA',
    level: 'JHS',
    description: 'Visual Arts, Music, Drama and Dance',
    syllabus: {
      topics: [
        'Drawing and Painting',
        'Ghanaian Art Forms (Adinkra, Kente)',
        'Music and Dance',
        'Drama and Theatre',
        'Design Principles'
      ]
    }
  },
  {
    name: 'COMPUTING',
    code: 'COMP',
    level: 'JHS',
    description: 'Computer Basics and Digital Literacy',
    syllabus: {
      topics: [
        'Computer Systems',
        'Microsoft Office (Word, Excel, PowerPoint)',
        'Internet Basics',
        'Digital Citizenship',
        'Basic Programming Concepts'
      ]
    }
  }
];

const SHS_SUBJECTS = [
  {
    name: 'MATHEMATICS',
    code: 'CMATH',
    level: 'SHS',
    description: 'Core Mathematics - Advanced Topics',
    syllabus: {
      topics: [
        'Algebra and Surds',
        'Quadratic Equations',
        'Trigonometry',
        'Coordinate Geometry',
        'Vectors and Transformations',
        'Calculus - Differentiation and Integration',
        'Statistics and Probability'
      ]
    }
  },
  {
    name: 'ENGLISH',
    code: 'CENG',
    level: 'SHS',
    description: 'Core English Language',
    syllabus: {
      topics: [
        'Advanced Grammar',
        'Comprehension and Interpretation',
        'Summary Writing',
        'Essay Writing (Argumentative, Expository)',
        'Literature Analysis',
        'Oral English and Phonetics'
      ]
    }
  },
  {
    name: 'SOCIAL STUDIES',
    code: 'SSOC',
    level: 'SHS',
    description: 'Social Studies - Citizenship and Development',
    syllabus: {
      topics: [
        'Democracy and Governance',
        'Human Rights',
        'Economic Development',
        'Social Issues',
        'Environmental Sustainability',
        'Pan-Africanism'
      ]
    }
  },
  {
    name: 'ECONOMICS',
    code: 'ECON',
    level: 'SHS',
    description: 'Principles of Economics',
    syllabus: {
      topics: [
        'Basic Economic Concepts',
        'Demand and Supply',
        'Production and Costs',
        'Market Structures',
        'National Income',
        'Money and Banking',
        'International Trade'
      ]
    }
  },
  {
    name: 'SCIENCE',
    code: 'SCI',
    level: 'SHS',
    description: 'General Science (Biology, Chemistry, Physics)',
    syllabus: {
      topics: [
        'Biology - Cells, Genetics, Ecology',
        'Chemistry - Atoms, Bonding, Reactions',
        'Physics - Mechanics, Energy, Electricity',
        'Scientific Method'
      ]
    }
  },
  {
    name: 'HISTORY',
    code: 'SHIST',
    level: 'SHS',
    description: 'Ghana and World History',
    syllabus: {
      topics: [
        'World Civilizations',
        'Industrial Revolution',
        'World Wars',
        'African Independence Movements',
        'Post-Colonial Africa',
        'Contemporary Issues'
      ]
    }
  }
];

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing subjects
    await prisma.subject.deleteMany();
    console.log('✅ Cleared existing subjects');

    // Seed JHS subjects
    console.log('📚 Seeding JHS subjects...');
    for (const subject of JHS_SUBJECTS) {
      await prisma.subject.create({
        data: subject
      });
      console.log(`  ✓ Created ${subject.name} (${subject.level})`);
    }

    // Seed SHS subjects
    console.log('📚 Seeding SHS subjects...');
    for (const subject of SHS_SUBJECTS) {
      await prisma.subject.create({
        data: subject
      });
      console.log(`  ✓ Created ${subject.name} (${subject.level})`);
    }

    const totalSubjects = await prisma.subject.count();
    console.log(`\n✨ Database seeded successfully!`);
    console.log(`📊 Total subjects created: ${totalSubjects}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
