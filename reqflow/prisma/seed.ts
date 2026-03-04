import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.workLog.deleteMany();
  await prisma.requirementFile.deleteMany();
  await prisma.projectFile.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create 5 users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        name: 'Alice Chen',
        email: 'alice@reqflow.com',
        password: '$2a$10$dummyhash1',
        role: 'ADMIN',
        locale: 'en',
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-2',
        name: 'Bob Wang',
        email: 'bob@reqflow.com',
        password: '$2a$10$dummyhash2',
        role: 'PM',
        locale: 'zh',
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-3',
        name: 'Carol Li',
        email: 'carol@reqflow.com',
        password: '$2a$10$dummyhash3',
        role: 'DEVELOPER',
        locale: 'en',
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-4',
        name: 'David Zhang',
        email: 'david@reqflow.com',
        password: '$2a$10$dummyhash4',
        role: 'DEVELOPER',
        locale: 'zh',
        avatar: null,
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-5',
        name: 'Eve Liu',
        email: 'eve@reqflow.com',
        password: '$2a$10$dummyhash5',
        role: 'STAKEHOLDER',
        locale: 'en',
        avatar: null,
      },
    }),
  ]);

  // Create 2 projects
  const project1 = await prisma.project.create({
    data: {
      id: 'proj-1',
      name: 'Q2 Campaign Landing Pages',
      nameZh: 'Q2营销活动落地页',
      description: 'Build and optimize landing pages for Q2 marketing campaigns',
      descriptionZh: '构建并优化Q2营销活动落地页',
      status: 'EXECUTION',
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-06-30'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      id: 'proj-2',
      name: 'Website Redesign Phase 2',
      nameZh: '网站改版第二阶段',
      description: 'Complete redesign of product pages and checkout flow',
      descriptionZh: '产品页面和结算流程的全面改版',
      status: 'PLANNING',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-09-30'),
    },
  });

  // Add members to projects
  await Promise.all([
    prisma.projectMember.create({ data: { projectId: project1.id, userId: users[0].id, role: 'PM' } }),
    prisma.projectMember.create({ data: { projectId: project1.id, userId: users[1].id, role: 'PM' } }),
    prisma.projectMember.create({ data: { projectId: project1.id, userId: users[2].id, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: project1.id, userId: users[3].id, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: project1.id, userId: users[4].id, role: 'STAKEHOLDER' } }),
    prisma.projectMember.create({ data: { projectId: project2.id, userId: users[0].id, role: 'PM' } }),
    prisma.projectMember.create({ data: { projectId: project2.id, userId: users[2].id, role: 'MEMBER' } }),
    prisma.projectMember.create({ data: { projectId: project2.id, userId: users[4].id, role: 'STAKEHOLDER' } }),
  ]);

  // Create milestones
  const milestone1 = await prisma.milestone.create({
    data: {
      id: 'ms-1',
      projectId: project1.id,
      title: 'Campaign Pages Go-Live',
      titleZh: '活动页面上线',
      dueDate: new Date('2026-04-15'),
      description: 'All Q2 campaign landing pages live and tested',
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      id: 'ms-2',
      projectId: project1.id,
      title: 'Performance Review',
      titleZh: '效果评估',
      dueDate: new Date('2026-05-30'),
      description: 'Review conversion metrics and optimize',
    },
  });

  await prisma.milestone.create({
    data: {
      id: 'ms-3',
      projectId: project2.id,
      title: 'Design Approval',
      titleZh: '设计审批',
      dueDate: new Date('2026-04-30'),
      description: 'All page designs approved by stakeholders',
    },
  });

  // Create 8 requirements
  const requirements = [
    {
      id: 'req-1',
      projectId: project1.id,
      submittedById: users[4].id,
      assignedToId: users[2].id,
      title: 'SME Conversion Landing Page',
      titleZh: '中小企业转化落地页',
      requester: 'Eve Liu',
      contactEmail: 'eve@reqflow.com',
      desiredLaunchDate: new Date('2026-04-01'),
      isHardDeadline: true,
      hardDeadlineReason: 'Aligned with Q2 ad campaign launch',
      goal: 'CONVERSION',
      goalDetail: 'Drive SME signups through targeted landing page with clear value propositions',
      successMetric: 'Achieve 5% conversion rate within first 30 days',
      successMetricOwner: 'Marketing Analytics Team',
      pageScope: 'New page: /campaigns/sme-q2, languages: EN, ZH',
      audience: '["SME"]',
      targetRegions: '["UK","EU"]',
      priority: 'P0',
      priorityReason: 'Aligned with major Q2 campaign budget',
      status: 'IN_PROGRESS',
      kanbanColumn: 'IN_PROGRESS',
      sortOrder: 0,
      estimatedHours: 40,
      actualHours: 18,
      tags: '["campaign","sme","q2"]',
      milestoneId: milestone1.id,
    },
    {
      id: 'req-2',
      projectId: project1.id,
      submittedById: users[1].id,
      assignedToId: users[3].id,
      title: 'Enterprise Lead Gen Form',
      titleZh: '企业留资表单',
      requester: 'Bob Wang',
      contactEmail: 'bob@reqflow.com',
      desiredLaunchDate: new Date('2026-04-10'),
      goal: 'LEAD_GEN',
      goalDetail: 'Capture enterprise leads with detailed qualification form',
      successMetric: '200 qualified leads per month',
      pageScope: 'Revamp: /enterprise/contact, languages: EN',
      audience: '["Enterprise"]',
      targetRegions: '["UK","US","Global"]',
      priority: 'P0',
      status: 'IN_REVIEW',
      kanbanColumn: 'IN_REVIEW',
      sortOrder: 0,
      estimatedHours: 24,
      tags: '["enterprise","lead-gen"]',
      milestoneId: milestone1.id,
    },
    {
      id: 'req-3',
      projectId: project1.id,
      submittedById: users[4].id,
      assignedToId: users[2].id,
      title: 'App Download Campaign Page',
      titleZh: 'App下载推广页',
      requester: 'Eve Liu',
      contactEmail: 'eve@reqflow.com',
      desiredLaunchDate: new Date('2026-04-20'),
      goal: 'DOWNLOAD',
      goalDetail: 'Promote mobile app downloads with feature highlights and QR codes',
      successMetric: '10,000 downloads from this page in Q2',
      pageScope: 'New page: /app-download, languages: EN, ZH, FR',
      audience: '["Personal","SME"]',
      targetRegions: '["UK","EU","APAC"]',
      priority: 'P1',
      status: 'APPROVED',
      kanbanColumn: 'TODO',
      sortOrder: 0,
      estimatedHours: 32,
      tags: '["app","download","multilingual"]',
      milestoneId: milestone1.id,
    },
    {
      id: 'req-4',
      projectId: project1.id,
      submittedById: users[0].id,
      title: 'SEO Meta Tags Update',
      titleZh: 'SEO Meta标签更新',
      requester: 'Alice Chen',
      contactEmail: 'alice@reqflow.com',
      desiredLaunchDate: new Date('2026-03-20'),
      goal: 'AWARENESS',
      goalDetail: 'Update meta tags for all campaign pages for better organic visibility',
      successMetric: '20% increase in organic impressions for campaign pages',
      pageScope: 'All /campaigns/* pages',
      priority: 'P1',
      status: 'DONE',
      kanbanColumn: 'DONE',
      sortOrder: 0,
      estimatedHours: 8,
      actualHours: 6,
      tags: '["seo","meta"]',
      milestoneId: milestone2.id,
    },
    {
      id: 'req-5',
      projectId: project1.id,
      submittedById: users[1].id,
      title: 'A/B Test Registration Flow',
      titleZh: 'A/B测试注册流程',
      requester: 'Bob Wang',
      contactEmail: 'bob@reqflow.com',
      desiredLaunchDate: new Date('2026-05-01'),
      goal: 'REGISTRATION',
      goalDetail: 'Test 3 variants of registration flow to optimize completion rate',
      successMetric: '15% improvement in registration completion',
      pageScope: '/register page, languages: EN',
      priority: 'P2',
      status: 'SUBMITTED',
      kanbanColumn: 'BACKLOG',
      sortOrder: 0,
      estimatedHours: 48,
      tags: '["ab-test","registration"]',
    },
    {
      id: 'req-6',
      projectId: project1.id,
      submittedById: users[4].id,
      title: 'Campaign Analytics Dashboard',
      titleZh: '活动分析仪表板',
      requester: 'Eve Liu',
      contactEmail: 'eve@reqflow.com',
      desiredLaunchDate: new Date('2026-05-15'),
      goal: 'OTHER',
      goalDetail: 'Internal dashboard for tracking campaign page performance',
      successMetric: 'All campaign metrics visible in one view',
      pageScope: 'Internal tool, no public URL',
      priority: 'P2',
      status: 'DRAFT',
      kanbanColumn: 'BACKLOG',
      sortOrder: 1,
      estimatedHours: 60,
      tags: '["analytics","internal"]',
    },
    {
      id: 'req-7',
      projectId: project2.id,
      submittedById: users[0].id,
      assignedToId: users[2].id,
      title: 'Product Page Redesign',
      titleZh: '产品页面重新设计',
      requester: 'Alice Chen',
      contactEmail: 'alice@reqflow.com',
      desiredLaunchDate: new Date('2026-06-01'),
      designNeeded: true,
      goal: 'CONVERSION',
      goalDetail: 'Modernize product pages with better UX and clearer CTAs',
      successMetric: '10% improvement in product page conversion rate',
      pageScope: '/products/* pages, languages: EN, ZH',
      audience: '["SME","Enterprise","Personal"]',
      priority: 'P0',
      status: 'IN_REVIEW',
      kanbanColumn: 'IN_REVIEW',
      sortOrder: 0,
      estimatedHours: 80,
      tags: '["redesign","product","ux"]',
    },
    {
      id: 'req-8',
      projectId: project2.id,
      submittedById: users[4].id,
      title: 'Checkout Flow Optimization',
      titleZh: '结算流程优化',
      requester: 'Eve Liu',
      contactEmail: 'eve@reqflow.com',
      desiredLaunchDate: new Date('2026-07-01'),
      goal: 'CONVERSION',
      goalDetail: 'Reduce checkout abandonment by streamlining the payment flow',
      successMetric: '25% reduction in checkout abandonment rate',
      pageScope: '/checkout/* flow, languages: EN',
      priority: 'P1',
      status: 'SUBMITTED',
      kanbanColumn: 'BACKLOG',
      sortOrder: 0,
      estimatedHours: 64,
      tags: '["checkout","conversion","ux"]',
    },
  ];

  for (const req of requirements) {
    await prisma.requirement.create({ data: req });
  }

  // Create work logs for the past 2 weeks
  const today = new Date();
  const workLogEntries = [];
  for (let daysAgo = 0; daysAgo < 14; daysAgo++) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    if (date.getDay() === 0 || date.getDay() === 6) continue; // skip weekends

    workLogEntries.push(
      { userId: users[2].id, requirementId: 'req-1', projectId: project1.id, date, hours: 4 + Math.random() * 3, description: 'Frontend development work' },
      { userId: users[3].id, requirementId: 'req-2', projectId: project1.id, date, hours: 3 + Math.random() * 4, description: 'Form implementation and validation' },
    );
    if (daysAgo < 7) {
      workLogEntries.push(
        { userId: users[2].id, requirementId: 'req-7', projectId: project2.id, date, hours: 2 + Math.random() * 2, description: 'Product page redesign work' },
      );
    }
  }

  for (const wl of workLogEntries) {
    await prisma.workLog.create({ data: wl });
  }

  // Create some comments
  await prisma.comment.createMany({
    data: [
      { requirementId: 'req-1', authorId: users[1].id, content: 'Design mockup looks good. Please proceed with development.', isInternal: false },
      { requirementId: 'req-1', authorId: users[2].id, content: 'Started implementation. Hero section complete.', isInternal: false },
      { requirementId: 'req-1', authorId: users[0].id, content: 'Internal note: need to coordinate with compliance team for disclaimers', isInternal: true },
      { requirementId: 'req-2', authorId: users[3].id, content: 'Form validation complete, awaiting API endpoint spec.', isInternal: false },
      { requirementId: 'req-7', authorId: users[0].id, content: 'Figma designs shared with the team. Review by EOD Friday.', isInternal: false },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Created: ${users.length} users, 2 projects, 8 requirements, ${workLogEntries.length} work logs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
