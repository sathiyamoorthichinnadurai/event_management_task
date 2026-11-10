const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Event = require('../models/Event');

const seedData = async () => {
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany({});
    await Event.deleteMany({});

    console.log('[Seed] Creating demo users (Admin & User only)...');
    const admin = await User.create({
      name: 'Alice Administrator',
      email: 'admin@eventhub.com',
      password: 'Password@123',
      role: 'admin',
    });

    const user = await User.create({
      name: 'Charlie Attendee',
      email: 'user@eventhub.com',
      password: 'Password@123',
      role: 'user',
    });

    console.log('[Seed] Seeding sample events created by Admin...');
    const now = new Date();

    const sampleEvents = [
      {
        title: 'Global AI & Cloud Architecture Summit 2026',
        summary: 'Explore cutting-edge distributed systems, LLM fine-tuning, and scalable cloud patterns with industry pioneers.',
        description: 'Join over 2,500 software architects and AI researchers for 3 full days of intensive deep dives into real-time inference, vector database scaling, Kubernetes operator workflows, and modern agentic engineering. Features keynote speakers from leading tech organizations, hands-on architectural design workshops, and dedicated networking breakout lounges.',
        bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
        format: 'in-person',
        venue: 'Convention Center Hall A, San Francisco, CA',
        category: 'Technology',
        tags: ['AI', 'Cloud', 'Architecture', 'Kubernetes'],
        targetAudience: 'Software Engineers, Solutions Architects, Tech Leads, and AI Practitioners',
        registrationUrl: 'https://eventbrite.com/e/global-ai-summit-2026-demo',
        createdBy: admin._id,
        status: 'published',
        isActive: true,
        bookings: [
          {
            user: user._id,
            bookedAt: new Date(),
          },
        ],
      },
      {
        title: 'NextGen UI/UX & Design Systems Masterclass',
        summary: 'Learn how to craft accessible, token-driven multi-brand design systems in Figma and React from top design directors.',
        description: 'A comprehensive virtual masterclass focusing on token-driven component architecture, micro-interactions, WCAG 2.2 AA accessibility standards, and seamless handoff between designers and frontend developers. Includes downloadable design kits, live code pairing sessions, and portfolio reviews.',
        bannerUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
        format: 'online',
        venue: 'https://meet.google.com/xyz-design-masterclass',
        category: 'Design',
        tags: ['UI/UX', 'Design Systems', 'Figma', 'Accessibility'],
        targetAudience: 'UI/UX Designers, Product Designers, Design Engineers, and Frontend Developers',
        registrationUrl: 'https://luma.com/design-systems-masterclass-demo',
        createdBy: admin._id,
        status: 'published',
        isActive: true,
        bookings: [],
      },
      {
        title: 'B2B SaaS Growth & Product-Led Sales Conference',
        summary: 'Strategies from zero to $10M ARR: pricing experiments, customer onboarding funnels, and retention flywheels.',
        description: 'Hear directly from founders and VCs who scaled early-stage SaaS ventures to multi-million ARR milestones. Topics include bottom-up pricing models, churn mitigation, sales-assist workflows, and international expansion frameworks.',
        bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 18 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 19 * 24 * 60 * 60 * 1000),
        format: 'in-person',
        venue: 'TechHub Auditorium, 450 Lexington Ave, New York, NY',
        category: 'Business',
        tags: ['SaaS', 'Startups', 'Growth', 'Sales'],
        targetAudience: 'Founders, Product Managers, Growth Leads, and Investors',
        registrationUrl: 'https://eventbrite.com/e/saas-growth-conference-demo',
        createdBy: admin._id,
        status: 'published',
        isActive: true,
        bookings: [],
      },
      {
        title: 'Full-Stack MERN & TypeScript Performance Workshop',
        summary: 'Hands-on live coding workshop covering database indexing, caching strategies, and React rendering optimizations.',
        description: 'Interactive 6-hour code-along workshop. We will profile slow MongoDB queries, implement Redis caching layers, optimize React re-renders using modern hooks, and build resilient CI/CD pipelines with GitHub Actions.',
        bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        format: 'online',
        venue: 'https://zoom.us/j/9988776655-mern-workshop',
        category: 'Workshop',
        tags: ['React', 'Node.js', 'MongoDB', 'Performance', 'TypeScript'],
        targetAudience: 'Full-stack developers looking to level up their production engineering skills',
        registrationUrl: 'https://eventbrite.com/e/mern-performance-workshop-demo',
        createdBy: admin._id,
        status: 'published',
        isActive: true,
        bookings: [],
      },
      {
        title: 'Modern Marketing & Brand Storytelling in the Age of AI',
        summary: 'Leverage generative media, brand narratives, and personalized omni-channel campaigns that convert.',
        description: 'Marketing leaders from top brands share actionable playbooks on organic content loops, algorithmic distribution across social platforms, and utilizing AI workflows to produce creative campaigns at scale.',
        bannerUrl: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 26 * 24 * 60 * 60 * 1000),
        format: 'online',
        venue: 'https://meet.google.com/abc-marketing-summit',
        category: 'Marketing',
        tags: ['Marketing', 'Branding', 'Content', 'AI'],
        targetAudience: 'Marketers, Content Strategists, CMOs, and Creative Directors',
        registrationUrl: 'https://luma.com/brand-storytelling-demo',
        createdBy: admin._id,
        status: 'published',
        isActive: true,
        bookings: [],
      },
      {
        title: 'Internal Admin Draft Event (Disabled)',
        summary: 'Sample event in disabled state to showcase admin enable/disable workflow.',
        description: 'Draft conference outline currently hidden from regular users.',
        bannerUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        startDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 31 * 24 * 60 * 60 * 1000),
        format: 'in-person',
        venue: 'Room 402, Tech Center, Boston, MA',
        category: 'Conference',
        tags: ['Draft', 'Internal'],
        targetAudience: 'Internal staff only',
        registrationUrl: 'https://example.com/internal-registration',
        createdBy: admin._id,
        status: 'draft',
        isActive: false, // Disabled
        bookings: [],
      },
    ];

    await Event.insertMany(sampleEvents);

    console.log('[Seed] Database successfully seeded with:');
    console.log('   - 2 Roles Only: Admin and User');
    console.log('   - 6 Events (5 published & active, 1 disabled draft)');
    console.log('\n--- Login Credentials ---');
    console.log('Admin: admin@eventhub.com / Password@123  (Can create, edit, delete, toggle events)');
    console.log('User:  user@eventhub.com  / Password@123  (Can view and book events)');
    console.log('-------------------------\n');

    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Seeding failed. Please check database connectivity.');
    process.exit(1);
  }
};

seedData();
