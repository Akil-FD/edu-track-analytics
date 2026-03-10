"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const User_1 = require("../models/User");
const Article_1 = require("../models/Article");
const Analytics_1 = require("../models/Analytics");
const Highlights_1 = require("../models/Highlights");
const types_1 = require("../types");
const users = [
    {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.teacher@example.com',
        password: 'password123',
        role: types_1.UserRole.TEACHER,
    },
    {
        name: 'John Smith',
        email: 'john.student@example.com',
        password: 'password123',
        role: types_1.UserRole.STUDENT,
    },
    {
        name: 'Emily Davis',
        email: 'emily.student@example.com',
        password: 'password123',
        role: types_1.UserRole.STUDENT,
    },
    {
        name: 'Michael Brown',
        email: 'michael.student@example.com',
        password: 'password123',
        role: types_1.UserRole.STUDENT,
    },
    {
        name: 'Jessica Wilson',
        email: 'jessica.student@example.com',
        password: 'password123',
        role: types_1.UserRole.STUDENT,
    },
];
const articles = [
    {
        title: 'Introduction to Quantum Physics',
        category: types_1.ArticleCategory.SCIENCE,
        summary: 'A comprehensive guide to understanding the fundamentals of quantum physics and its applications.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'Quantum physics is the study of matter and energy at the most fundamental level. It aims to uncover the properties and behaviors of the very building blocks of nature.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'The key concepts include wave-particle duality, superposition, and quantum entanglement. These phenomena challenge our classical understanding of physics.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', caption: 'Quantum superposition visualization' },
            { type: types_1.ContentBlockType.TEXT, content: 'Quantum mechanics has led to revolutionary technologies including quantum computers, MRI machines, and lasers.', fileUrl: '', caption: '' },
        ],
    },
    {
        title: 'Calculus: Derivatives and Integrals',
        category: types_1.ArticleCategory.MATH,
        summary: 'Master the core concepts of calculus including derivatives, integrals, and their applications.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'Calculus is a branch of mathematics that studies continuous change. It has two main branches: differential calculus and integral calculus.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'The derivative represents the rate of change of a function with respect to a variable. It is fundamental to understanding how quantities change.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'Integration is the reverse process of differentiation. It is used to calculate areas, volumes, and to solve differential equations.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', caption: 'Calculus visualization' },
        ],
    },
    {
        title: 'The Art of Creative Writing',
        category: types_1.ArticleCategory.ENGLISH,
        summary: 'Learn techniques to enhance your creative writing skills and develop your unique voice.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'Creative writing is any form of writing that goes beyond normal professional, journalistic, or academic forms. It allows the writer to express thoughts, feelings, and emotions.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'Key elements include character development, setting, plot, point of view, and theme. Mastering these elements will help you create compelling stories.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.VIDEO, content: '', fileUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', caption: 'Writing tips tutorial' },
            { type: types_1.ContentBlockType.TEXT, content: 'Practice regularly and read widely to improve your craft. Remember, every great writer started somewhere!', fileUrl: '', caption: '' },
        ],
    },
    {
        title: 'World War II: A Comprehensive Overview',
        category: types_1.ArticleCategory.HISTORY,
        summary: 'Explore the major events, key figures, and outcomes of the Second World War.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'World War II (1939-1945) was the deadliest and most widespread conflict in human history, involving more than 100 million people from over 30 countries.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'The major powers were divided into two opposing alliances: the Allies and the Axis. The war ended with the unconditional surrender of Germany and Japan.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1580130379624-3a069adbffc5?w=800', caption: 'Historical wartime photograph' },
            { type: types_1.ContentBlockType.TEXT, content: 'The aftermath of WWII led to the creation of the United Nations, the beginning of the Cold War, and the establishment of international human rights treaties.', fileUrl: '', caption: '' },
        ],
    },
    {
        title: 'Introduction to Machine Learning',
        category: types_1.ArticleCategory.TECHNOLOGY,
        summary: 'Discover the fundamentals of machine learning and its applications in modern technology.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'There are three main types of machine learning: supervised learning, unsupervised learning, and reinforcement learning.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800', caption: 'Machine learning neural network visualization' },
            { type: types_1.ContentBlockType.TEXT, content: 'Applications of machine learning include image recognition, natural language processing, recommendation systems, and autonomous vehicles.', fileUrl: '', caption: '' },
        ],
    },
    {
        title: 'Understanding Modern Art Movements',
        category: types_1.ArticleCategory.ART,
        summary: 'Explore the evolution of art from Impressionism to Contemporary art.',
        contentBlocks: [
            { type: types_1.ContentBlockType.TEXT, content: 'Modern art encompasses artistic work produced during the period extending roughly from the 1860s to the 1970s. It represents a break from traditional techniques and styles.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.TEXT, content: 'Major movements include Impressionism, Cubism, Surrealism, Abstract Expressionism, and Pop Art. Each movement challenged conventional views of art.', fileUrl: '', caption: '' },
            { type: types_1.ContentBlockType.IMAGE, content: '', fileUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800', caption: 'Modern art exhibition' },
            { type: types_1.ContentBlockType.TEXT, content: 'Understanding modern art requires an open mind and willingness to interpret meaning beyond traditional aesthetics.', fileUrl: '', caption: '' },
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
const clearDatabase = async () => {
    await User_1.User.deleteMany({});
    await Article_1.Article.deleteMany({});
    await Analytics_1.Analytics.deleteMany({});
    await Highlights_1.Highlight.deleteMany({});
    console.log('🗑️  Database cleared');
};
const createUsers = async () => {
    const hashedUsers = await Promise.all(users.map(async (user) => ({
        ...user,
        password: await bcryptjs_1.default.hash(user.password, 12),
    })));
    const createdUsers = await User_1.User.insertMany(hashedUsers);
    console.log(`👥 Created ${createdUsers.length} users`);
    return createdUsers;
};
const createArticles = async (teacherId) => {
    const articlesWithCreator = articles.map((article) => ({
        ...article,
        createdBy: teacherId,
    }));
    const createdArticles = await Article_1.Article.insertMany(articlesWithCreator);
    console.log(`📄 Created ${createdArticles.length} articles`);
    return createdArticles;
};
const createAnalytics = async (articles, students) => {
    const analyticsRecords = [];
    for (let i = 0; i < articles.length; i++) {
        const article = articles[i];
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
    await Analytics_1.Analytics.insertMany(analyticsRecords);
    console.log(`📊 Created ${analyticsRecords.length} analytics records`);
};
const createHighlights = async (articles, students) => {
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
    await Highlights_1.Highlight.insertMany(highlightRecords);
    console.log(`🎨 Created ${highlightRecords.length} highlights`);
};
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        await (0, database_1.connectDatabase)();
        await clearDatabase();
        const createdUsers = await createUsers();
        const teacher = createdUsers.find((u) => u.role === types_1.UserRole.TEACHER);
        const students = createdUsers.filter((u) => u.role === types_1.UserRole.STUDENT);
        const createdArticles = await createArticles(teacher._id);
        await createAnalytics(createdArticles, students);
        await createHighlights(createdArticles, students);
        console.log('✅ Database seeded successfully!');
        console.log('');
        console.log('📝 Login credentials:');
        console.log('   Teacher: sarah.teacher@example.com / password123');
        console.log('   Student: john.student@example.com / password123');
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
    }
    finally {
        await (0, database_1.disconnectDatabase)();
        process.exit(0);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map