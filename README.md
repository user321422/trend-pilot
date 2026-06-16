# TrendPilot AI

## Hackathon Project Plan & Team Division

---

# Project Overview

TrendPilot AI is an AI-powered content operations platform that automatically transforms trending internet topics into publish-ready content workflows.

The system continuously monitors trend sources, evaluates relevance using AI, generates content briefs, assigns writers, reviews submitted drafts, and prepares content for publishing.

The goal is to reduce the content creation cycle from days to hours while keeping humans involved in critical decisions.

---

# Problem Statement

Content teams often miss trending opportunities because:

* Topic discovery is manual
* Research takes too long
* Brief creation is repetitive
* Writer assignment is inefficient
* SEO optimization is inconsistent
* Publishing workflows are fragmented

TrendPilot AI automates these processes while preserving editorial control.

---

# Target Users

* Digital Marketing Agencies
* SaaS Companies
* News Organizations
* Bloggers
* Content Teams
* Startup Marketing Departments

---

# Core Workflow

## Phase 1: Trend Detection

System collects trending topics from:

* Google Trends
* Reddit
* News Sources

Output:

* Topic Title
* Trend Score
* Relevance Score
* Opportunity Score
* AI Explanation

---

## Phase 2: Brief Generation

AI generates:

* Topic Summary
* Audience Analysis
* Unique Content Angle
* SEO Keywords
* H1 Suggestions
* H2/H3 Structure
* Recommended Word Count

---

## Phase 3: Human Approval

Editor can:

* Approve Brief
* Reject Brief
* Edit Brief

---

## Phase 4: Writer Assignment

System recommends best writer using:

* Expertise
* Availability
* Historical Performance

---

## Phase 5: Draft Review

AI checks:

* SEO Compliance
* Readability
* Missing Sections
* Keyword Coverage
* Brief Compliance

---

## Phase 6: Publish Preparation

System generates:

* Publish Schedule
* LinkedIn Post
* Twitter/X Post
* Content Export

---

# MVP Scope

For Hackathon Version:

✅ Trend Detection

✅ AI Brief Generation

✅ Brief Approval

✅ Writer Assignment

✅ Draft Review

✅ Publish Simulation

❌ Real CMS Integration

❌ Advanced Analytics

❌ Multi-Tenant Support

❌ Full Slack Integration

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router

## Backend

* Node.js
* Express.js

## Database

* PostgreSQL
* Prisma ORM

## AI

* Qwen API

## Authentication

* JWT

## Deployment

* Vercel (Frontend)
* Render / Railway (Backend)

---

# Team Division

## Member 1 

### Backend & AI Lead

Responsibilities:

### Authentication

* Login
* Registration
* JWT Middleware
* Role Management

### Database Design

* Prisma Models
* Database Relations
* Migrations

### Trend Engine

* Google Trends Integration
* Reddit Integration
* Trend Scoring Logic

### AI Features

* Qwen API Integration
* Brief Generation
* Writer Recommendation
* Draft Review System

### Backend APIs

#### Auth

* POST /auth/login
* POST /auth/register

#### Trends

* GET /trends
* GET /trends/

#### Briefs

* POST /briefs/generate
* PATCH /briefs/approve

#### Assignments

* POST /assignments

#### Reviews

* POST /reviews/analyze

---

## Member 2 

### Frontend & UI Lead

Responsibilities:

### UI System

* Tailwind Setup
* Component Library
* Responsive Design

### Pages

#### Authentication

* Login Page

#### Dashboard

* Metrics Cards
* Recent Activity
* Trend Overview

#### Trends

* Trend List
* Trend Detail

#### Briefs

* Brief Viewer
* Approval Interface

#### Assignments

* Assignment Dashboard
* Writer Workspace

#### Reviews

* Review Results
* SEO Score Display

### Frontend Integration

* API Integration
* State Management
* Loading States
* Error Handling

---

# Shared Responsibilities

## Testing

Both Members:

* API Testing
* UI Testing
* End-to-End Flow Testing

## Deployment

Both Members:

* Environment Variables
* Production Deployment
* Demo Environment

## Presentation

Both Members:

* Demo Preparation
* Architecture Diagram
* Pitch Deck
* Judge Q&A

---

# Development Timeline

## Day 1

Backend:

* Project Setup
* Database Design
* Authentication

Frontend:

* React Setup
* Layout System
* Login UI

---

## Day 2

Backend:

* Trend APIs
* Trend Scoring

Frontend:

* Dashboard
* Trends Page

---

## Day 3

Backend:

* Qwen Integration
* Brief Generation

Frontend:

* Brief Pages

---

## Day 4

Backend:

* Assignment Logic
* Review Engine

Frontend:

* Assignment UI
* Review UI

---

## Day 5

Backend:

* Final APIs
* Bug Fixes

Frontend:

* Final Polish
* Responsive Design

---

## Day 6

* Integration Testing
* Deployment
* Demo Preparation

---

# Demo Flow

1. Open Dashboard
2. View Trending Topics
3. Generate AI Brief
4. Approve Brief
5. Assign Writer
6. Submit Draft
7. Run AI Review
8. Approve Publishing
9. Generate Social Posts

Total Demo Time: 3-4 Minutes

---

# Success Criteria

* End-to-end workflow operational
* AI-generated briefs working
* Writer assignment functioning
* Draft review functioning
* Clean UI
* Stable demo
* Deployment completed

---

# Future Scope

* Slack Integration
* WordPress Publishing
* Multi-Tenant Architecture
* Analytics Dashboard
* Performance Feedback Loop
* Content Calendar
* Automated Social Publishing
* Enterprise Team Management
