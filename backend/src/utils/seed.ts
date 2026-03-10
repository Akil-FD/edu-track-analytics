import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { User } from '../models/User';
import { Article } from '../models/Article';
import { Analytics } from '../models/Analytics';
import { Highlight } from '../models/Highlights';
import { IUser, IArticle, UserRole, ArticleCategory, ContentBlockType } from '../types';

// Database info:
// - Database name is configured in MONGO_URI (e.g., mongodb://localhost:27017/your_database_name)
// Collection names:
// - users, articles, analytics, highlights

// ─── Seed Data ────────────────────────────────────────────────────────────────

const users = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.teacher@example.com',
    password: 'password123',
    role: UserRole.TEACHER,
  },
  {
    name: 'John Smith',
    email: 'john.student@example.com',
    password: 'password123',
    role: UserRole.STUDENT,
  },
  {
    name: 'Emily Davis',
    email: 'emily.student@example.com',
    password: 'password123',
    role: UserRole.STUDENT,
  },
  {
    name: 'Michael Brown',
    email: 'michael.student@example.com',
    password: 'password123',
    role: UserRole.STUDENT,
  },
  {
    name: 'Jessica Wilson',
    email: 'jessica.student@example.com',
    password: 'password123',
    role: UserRole.STUDENT,
  },
];

const articles = [
  {
    title: 'Introduction to Quantum Physics',
    category: ArticleCategory.SCIENCE,
    summary: 'A comprehensive guide to understanding the fundamentals of quantum physics and its applications.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'Quantum physics is the study of matter and energy at the most fundamental level. It aims to uncover the properties and behaviors of the very building blocks of nature.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'The key concepts include wave-particle duality, superposition, and quantum entanglement. These phenomena challenge our classical understanding of physics.', fileUrl: '', caption: '' },
      { type: ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', caption: 'Quantum superposition visualization' },
      { type: ContentBlockType.TEXT, content: 'Quantum mechanics has led to revolutionary technologies including quantum computers, MRI machines, and lasers.', fileUrl: '', caption: '' },
    ],
  },
  {
    title: 'Calculus: Derivatives and Integrals',
    category: ArticleCategory.MATH,
    summary: 'Master the core concepts of calculus including derivatives, integrals, and their applications.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'Calculus is a branch of mathematics that studies continuous change. It has two main branches: differential calculus and integral calculus.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'The derivative represents the rate of change of a function with respect to a variable. It is fundamental to understanding how quantities change.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'Integration is the reverse process of differentiation. It is used to calculate areas, volumes, and to solve differential equations.', fileUrl: '', caption: '' },
      { type: ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', caption: 'Calculus visualization' },
    ],
  },
  {
    title: 'The Art of Creative Writing',
    category: ArticleCategory.ENGLISH,
    summary: 'Learn techniques to enhance your creative writing skills and develop your unique voice.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'Creative writing is any form of writing that goes beyond normal professional, journalistic, or academic forms. It allows the writer to express thoughts, feelings, and emotions.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'Key elements include character development, setting, plot, point of view, and theme. Mastering these elements will help you create compelling stories.', fileUrl: '', caption: '' },
      { type: ContentBlockType.VIDEO, content: '', fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Writing tips tutorial' },
      { type: ContentBlockType.TEXT, content: 'Practice regularly and read widely to improve your craft. Remember, every great writer started somewhere!', fileUrl: '', caption: '' },
    ],
  },
  {
    title: 'World War II: A Comprehensive Overview',
    category: ArticleCategory.HISTORY,
    summary: 'Explore the major events, key figures, and outcomes of the Second World War.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'World War II (1939-1945) was the deadliest and most widespread conflict in human history, involving more than 100 million people from over 30 countries.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'The major powers were divided into two opposing alliances: the Allies and the Axis. The war ended with the unconditional surrender of Germany and Japan.', fileUrl: '', caption: '' },
      { type: ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=800', caption: 'Historical wartime photograph' },
      { type: ContentBlockType.TEXT, content: 'The aftermath of WWII led to the creation of the United Nations, the beginning of the Cold War, and the establishment of international human rights treaties.', fileUrl: '', caption: '' },
    ],
  },
  {
    title: 'Introduction to Machine Learning',
    category: ArticleCategory.TECHNOLOGY,
    summary: 'Discover the fundamentals of machine learning and its applications in modern technology.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.', fileUrl: '', caption: '' },
      { type: ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800', caption: 'Machine learning neural network visualization' },
      { type: ContentBlockType.TEXT, content: 'Applications of machine learning include image recognition, natural language processing, recommendation systems, and autonomous vehicles.', fileUrl: '', caption: '' },
    ],
  },
  {
    title: 'Understanding Modern Art Movements',
    category: ArticleCategory.ART,
    summary: 'Explore the evolution of art from Impressionism to Contemporary art.',
    contentBlocks: [
      { type: ContentBlockType.TEXT, content: 'Modern art encompasses artistic work produced during the period extending roughly from the 1860s to the 1970s. It represents a break from traditional techniques and styles.', fileUrl: '', caption: '' },
      { type: ContentBlockType.TEXT, content: 'Major movements include Impressionism, Cubism, Surrealism, Abstract Expressionism, and Pop Art. Each movement challenged conventional views of art.', fileUrl: '', caption: '' },
      { type: ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', caption: 'Modern art exhibition' },
      { type: ContentBlockType.TEXT, content: 'Understanding modern art requires an open mind and willingness to interpret meaning beyond traditional aesthetics.', fileUrl: '', caption: '' },
    ],
  },
];

const analyticsData = [
  { views: 15, duration: 1200, lastRead: new Date('2024-01-15') },
  { views: 8, duration: 600, lastRead: new Date('2024-01-16') },
  { views: 22, duration: 1800, lastRead: new Date('2024-01-17') },
  { views: 12, duration: 900, lastRead: new Date('2024-01-18') },
  { views: 18, duration: 1500, lastRead: new Date('2024-01-19') },
  { views: 5, duration: 300, lastRead: new Date('2024-01-20') },
  { views: 10, duration: 800, lastRead: new Date('2024-01-21') },
  { views: 25, duration: 2100, lastRead: new Date('2024-01-22') },
  { views: 7, duration: 450, lastRead: new Date('2024-01-23') },
  { views: 14, duration: 1100, lastRead: new Date('2024-01-24') },
];

const highlightsData = [
  { text: 'Quantum physics is the study of matter and energy at the most fundamental level.', note: 'Important definition' },
  { text: 'The key concepts include wave-particle duality, superposition, and quantum entanglement.', note: 'Key concepts to remember' },
  { text: 'The derivative represents the rate of change of a function with respect to a variable.', note: 'Core calculus concept' },
  { text: 'Creative writing is any form of writing that goes beyond normal professional forms.', note: 'Great definition!' },
  { text: 'World War II was the deadliest and most widespread conflict in human history.', note: 'Important historical fact' },
  { text: 'Machine learning is a subset of artificial intelligence that enables systems to learn.', note: 'Key AI concept' },
];

// ─── Helper Functions ─────────────────────────────────────────────────────────

const clearDatabase = async (): Promise<void> => {
  await User.deleteMany({});
  await Article.deleteMany({});
  await Analytics.deleteMany({});
  await Highlight.deleteMany({});
  console.log('🗑️  Database cleared');
};

const createUsers = async (): Promise<IUser[]> => {
  // Hash passwords before inserting
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 12),
    }))
  );
  const createdUsers = await User.insertMany(hashedUsers);
  console.log(`👥 Created ${createdUsers.length} users`);
  return createdUsers;
};

const createArticles = async (teacherId: mongoose.Types.ObjectId): Promise<IArticle[]> => {
  const articlesWithCreator = articles.map((article) => ({
    ...article,
    createdBy: teacherId,
  }));
  const createdArticles = await Article.insertMany(articlesWithCreator) as unknown as IArticle[];
  console.log(`📄 Created ${createdArticles.length} articles`);
  return createdArticles;
};

const createAnalytics = async (
  articles: IArticle[],
  students: IUser[]
): Promise<void> => {
  const analyticsRecords = [];
  
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    // Each article has analytics from 1-3 random students
    const numStudents = Math.floor(Math.random() * 3) + 1;
    const shuffledStudents = [...students].sort(() => Math.random() - 0.5);
    
    for (let j = 0; j < numStudents; j++) {
      const analytics = analyticsData[i % analyticsData.length];
      analyticsRecords.push({
        articleId: article._id,
        studentId: shuffledStudents[j]._id,
        views: analytics.views,
        duration: analytics.duration,
        lastRead: analytics.lastRead,
      });
    }
  }
  
  await Analytics.insertMany(analyticsRecords);
  console.log(`📊 Created ${analyticsRecords.length} analytics records`);
};

const createHighlights = async (
  articles: IArticle[],
  students: IUser[]
): Promise<void> => {
  const highlightRecords = [];
  
  for (let i = 0; i < highlightsData.length; i++) {
    const articleIndex = i % articles.length;
    const studentIndex = i % students.length;
    
    highlightRecords.push({
      studentId: students[studentIndex]._id,
      articleId: articles[articleIndex]._id,
      text: highlightsData[i].text,
      note: highlightsData[i].note,
    });
  }
  
  await Highlight.insertMany(highlightRecords);
  console.log(`🎨 Created ${highlightRecords.length} highlights`);
};

// ─── Main Seed Function ────────────────────────────────────────────────────────

const seedDatabase = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDatabase();
    
    // Clear existing data
    await clearDatabase();
    
    // Create users
    const createdUsers = await createUsers();
    const teacher = createdUsers.find((u) => u.role === UserRole.TEACHER)!;
    const students = createdUsers.filter((u) => u.role === UserRole.STUDENT);
    
    // Create articles
    const createdArticles = await createArticles(teacher._id as mongoose.Types.ObjectId);
    
    // Create analytics
    await createAnalytics(createdArticles, students);
    
    // Create highlights
    await createHighlights(createdArticles, students);
    
    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log('   Teacher: sarah.teacher@example.com / password123');
    console.log('   Student: john.student@example.com / password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
};

// Run the seed function
seedDatabase();

