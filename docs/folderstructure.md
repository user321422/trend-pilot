trendpilot-ai/
├── README.md
├── .gitignore
├── .env.example
├── package.json
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── trends/
│   │   │   │   ├── TrendsPage.tsx
│   │   │   │   └── TrendDetailPage.tsx
│   │   │   ├── briefs/
│   │   │   │   └── BriefPage.tsx
│   │   │   ├── assignments/
│   │   │   │   └── AssignmentsPage.tsx
│   │   │   ├── reviews/
│   │   │   │   └── ReviewPage.tsx
│   │   │   └── publish/
│   │   │       └── PublishPage.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── DashboardLayout.tsx
│   │   │   ├── ui/
│   │   │   ├── dashboard/
│   │   │   ├── trends/
│   │   │   ├── briefs/
│   │   │   ├── assignments/
│   │   │   └── reviews/
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── trends.service.ts
│   │   │   ├── briefs.service.ts
│   │   │   ├── assignments.service.ts
│   │   │   └── reviews.service.ts
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   │
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── trend.types.ts
│   │   │   ├── brief.types.ts
│   │   │   ├── assignment.types.ts
│   │   │   └── review.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   └── helpers.ts
│   │   │
│   │   └── styles/
│   │       └── globals.css
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   │
│   ├── src/
│   │   ├── server.ts
│   │   ├── app.ts
│   │   │
│   │   ├── config/
│   │   │   ├── env.ts
│   │   │   ├── prisma.ts
│   │   │   └── qwen.ts
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── trend.routes.ts
│   │   │   ├── brief.routes.ts
│   │   │   ├── assignment.routes.ts
│   │   │   ├── review.routes.ts
│   │   │   └── publish.routes.ts
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── trend.controller.ts
│   │   │   ├── brief.controller.ts
│   │   │   ├── assignment.controller.ts
│   │   │   ├── review.controller.ts
│   │   │   └── publish.controller.ts
│   │   │
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── trend.service.ts
│   │   │   ├── scoring.service.ts
│   │   │   ├── qwen.service.ts
│   │   │   ├── brief.service.ts
│   │   │   ├── assignment.service.ts
│   │   │   ├── review.service.ts
│   │   │   └── publish.service.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── role.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   │
│   │   ├── validators/
│   │   │   ├── auth.validator.ts
│   │   │   ├── brief.validator.ts
│   │   │   ├── assignment.validator.ts
│   │   │   └── review.validator.ts
│   │   │
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── trend.types.ts
│   │   │   ├── brief.types.ts
│   │   │   └── review.types.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.ts
│   │   │   ├── response.ts
│   │   │   └── prompts.ts
│   │   │
│   │   └── data/
│   │       ├── mockTrends.ts
│   │       ├── mockWriters.ts
│   │       └── mockActivities.ts
│
└── docs/
    ├── API.md
    ├── DATABASE.md
    ├── DEMO_FLOW.md
    └── ARCHITECTURE.md