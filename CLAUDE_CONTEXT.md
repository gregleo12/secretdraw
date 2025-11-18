# CLAUDE_CONTEXT.md

This document provides architectural context, patterns, and key decisions for the SecretDraw project. It serves as a reference for AI assistants (like Claude) to understand the codebase structure and maintain consistency.

## Project Philosophy

### Core Principles
1. **Type Safety First**: Use TypeScript strictly - no `any` types without justification
2. **Mobile-First Design**: Every UI component should work perfectly on mobile
3. **Privacy & Security**: User data and drawing results must be protected
4. **Simple User Experience**: Grandma should be able to use this app
5. **Maintainable Code**: Prefer clarity over cleverness

### Development Approach
- Write small, focused functions with single responsibilities
- Prefer composition over inheritance
- Keep business logic separate from framework code
- Write tests for critical algorithms (especially the matching algorithm)
- Document complex logic with comments explaining "why", not "what"

## Architecture Overview

### System Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │────────▶│   Express   │────────▶│ PostgreSQL  │
│  (React)    │  HTTP   │   Backend   │  SQL    │  Database   │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               │
                               ▼
                        ┌─────────────┐
                        │    Email    │
                        │   Service   │
                        └─────────────┘
```

### Data Flow Pattern

1. **User Action** → UI Component
2. **Component** → Custom Hook (optional)
3. **Hook/Component** → API Service Layer
4. **Service Layer** → HTTP Request to Backend
5. **Backend Route** → Controller
6. **Controller** → Service (Business Logic)
7. **Service** → Database (via Prisma)
8. **Response** ← Reverse the flow

## Key Architectural Decisions

### Decision 1: Monorepo with Separate Frontend/Backend
**Why**:
- Keeps concerns separated
- Easier to deploy independently if needed later
- Clear boundaries between client and server code
- Can scale teams independently

**Trade-offs**:
- Slightly more complex setup
- Need to manage two package.json files
- Shared types require duplication or a shared package

### Decision 2: Prisma ORM
**Why**:
- Type-safe database queries
- Excellent TypeScript integration
- Easy migrations
- Built-in connection pooling

**Alternative Considered**: Drizzle ORM (newer, but less mature)

### Decision 3: JWT Authentication
**Why**:
- Stateless (no session storage needed)
- Works well with Railway's ephemeral containers
- Easy to implement
- Mobile-friendly

**Security Notes**:
- Tokens stored in httpOnly cookies (not localStorage)
- Short expiration times (7 days)
- Refresh token rotation implemented

### Decision 4: Railway for Hosting
**Why**:
- Simple deployment from Git
- Built-in PostgreSQL
- Generous free tier for MVP
- Easy environment variable management

**Migration Path**: Can move to AWS/GCP later if needed

### Decision 5: PWA-First, Native Later
**Why**:
- Faster time to market
- Single codebase for web and mobile
- Capacitor allows easy native app conversion later
- Most features don't require native capabilities

## Database Schema Design

### Core Entities

```typescript
User
├── id (uuid)
├── email (unique)
├── name
├── passwordHash
├── createdAt
└── updatedAt

Group
├── id (uuid)
├── name
├── description
├── organizerId (→ User)
├── drawDate
├── createdAt
└── updatedAt

Participant
├── id (uuid)
├── groupId (→ Group)
├── userId (→ User, nullable)
├── name
├── email
├── isCouple (boolean)
├── couplePartnerId (→ Participant, nullable)
└── customExclusions (→ Participant[])

Drawing
├── id (uuid)
├── groupId (→ Group)
├── drawDate
├── isComplete (boolean)
└── results (encrypted JSON)

Assignment
├── id (uuid)
├── drawingId (→ Drawing)
├── giverId (→ Participant)
├── receiverId (→ Participant)
├── notificationSentAt (nullable)
└── viewed (boolean)
```

### Key Relationships
- One Group has many Participants
- One Group has many Drawings (historical record)
- One Drawing has many Assignments
- Participants can be linked as couples (self-referential)
- Participants can have custom exclusions (many-to-many)

## Matching Algorithm

### Requirements
The algorithm must create valid pairings where:
1. Nobody draws themselves
2. Couples don't draw each other
3. Custom exclusions are respected
4. Everyone gives to exactly one person
5. Everyone receives from exactly one person
6. No circular pairs (A→B, B→A) unless unavoidable
7. Avoid same pairings from previous years if possible

### Implementation Strategy
**Algorithm**: Graph-based maximum matching with constraints

**Approach**:
1. Build a directed graph where edges represent valid assignments
2. Remove edges for invalid pairings (self, couple, exclusions)
3. Use modified Hungarian algorithm or backtracking
4. Verify solution forms a single cycle (everyone connected)
5. If no solution exists, notify organizer of conflicting constraints

**File Location**: `backend/src/services/matchingService.ts`

**Edge Cases**:
- Odd number of participants (always solvable if valid)
- Over-constrained groups (detect and report)
- Groups with exactly 2 people who are couples (impossible)

## Frontend Architecture

### Component Organization

```
components/
├── common/              # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Modal.tsx
│   └── Card.tsx
├── layout/              # Layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Navigation.tsx
├── features/            # Feature-specific components
│   ├── auth/
│   ├── groups/
│   ├── participants/
│   └── drawing/
└── forms/               # Form components
    ├── LoginForm.tsx
    ├── GroupForm.tsx
    └── ParticipantForm.tsx
```

### State Management Strategy

**Local State**: React useState for component-specific state
**Server State**: Custom hooks wrapping fetch calls (consider React Query later)
**Global State**: React Context for authentication only
**Form State**: Controlled components (consider React Hook Form for complex forms)

### Routing Structure

```
/                          → Landing page
/login                     → Login page
/register                  → Registration page
/dashboard                 → User dashboard (groups list)
/groups/:id                → Group details
/groups/:id/participants   → Manage participants
/groups/:id/draw           → Execute drawing
/groups/:id/results        → View results (organizer only)
/assignment/:token         → View your assignment
```

## Backend Architecture

### Route Organization

```
routes/
├── auth.routes.ts        # POST /auth/login, /auth/register
├── users.routes.ts       # GET/PUT /users/:id
├── groups.routes.ts      # CRUD /groups
├── participants.routes.ts # CRUD /groups/:id/participants
└── drawings.routes.ts    # POST /groups/:id/draw, GET /assignments
```

### Middleware Stack

1. **cors**: Allow requests from frontend
2. **helmet**: Security headers
3. **express.json**: Parse JSON bodies
4. **morgan**: Request logging
5. **authMiddleware**: JWT validation (protected routes)
6. **errorHandler**: Centralized error handling

### Service Layer Pattern

Each major feature has a service class:

```typescript
class GroupService {
  async createGroup(data: CreateGroupDto): Promise<Group>
  async getGroup(id: string): Promise<Group>
  async updateGroup(id: string, data: UpdateGroupDto): Promise<Group>
  async deleteGroup(id: string): Promise<void>
}
```

**Benefits**:
- Business logic separate from HTTP layer
- Easy to test
- Reusable across different routes
- Clear dependencies

## Security Considerations

### Authentication Flow
1. User submits email/password
2. Backend validates credentials
3. Generate JWT with user ID and role
4. Return JWT in httpOnly cookie
5. Frontend sends cookie with each request
6. Backend validates JWT in middleware

### Authorization Levels
- **Anonymous**: Can view landing page only
- **Authenticated**: Can create groups, join groups
- **Group Organizer**: Can manage participants, execute draws
- **Admin**: Can view all groups (future feature)

### Data Protection
- **Passwords**: Hashed with bcrypt (12 rounds)
- **Drawing Results**: Encrypted at rest (only assignment owners can decrypt)
- **Email Addresses**: Not shared publicly
- **Assignment Links**: Contain non-guessable tokens

### Input Validation
- Use Zod schemas for runtime validation
- Validate on both frontend (UX) and backend (security)
- Sanitize user input to prevent XSS
- Use parameterized queries (Prisma handles this)

## Testing Strategy

### Backend Tests
- **Unit Tests**: Service layer functions
- **Integration Tests**: API endpoints with test database
- **Critical Path**: Matching algorithm must have 100% coverage

### Frontend Tests
- **Unit Tests**: Utility functions, hooks
- **Component Tests**: UI components in isolation
- **E2E Tests**: Critical user flows (create group → draw names)

### Test Database
- Use Docker for local PostgreSQL test instance
- Reset database between test suites
- Seed with realistic test data

## Error Handling Patterns

### Backend Errors

```typescript
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
  }
}

// Usage
throw new AppError(404, 'Group not found');
```

### Frontend Errors

```typescript
// API calls return standardized error format
interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}

// Display user-friendly messages
const errorMessages = {
  NETWORK_ERROR: 'Please check your connection',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Please log in again',
};
```

## Performance Considerations

### Frontend
- Lazy load routes with React.lazy()
- Memoize expensive computations
- Optimize images (WebP, lazy loading)
- Virtual scrolling for large participant lists
- PWA caching strategy for static assets

### Backend
- Database connection pooling (Prisma default)
- Add indexes on frequently queried fields
- Implement request caching for public data
- Rate limiting on auth endpoints
- Pagination for large datasets

### Database Indexes
```sql
-- Frequently queried fields
CREATE INDEX idx_groups_organizer ON groups(organizer_id);
CREATE INDEX idx_participants_group ON participants(group_id);
CREATE INDEX idx_assignments_drawing ON assignments(drawing_id);
CREATE INDEX idx_users_email ON users(email);
```

## Deployment Configuration

### Environment Variables

**Backend (.env)**
```
DATABASE_URL=        # Railway PostgreSQL
JWT_SECRET=          # Generate with: openssl rand -base64 32
FRONTEND_URL=        # Railway frontend URL
SMTP_HOST=           # Email service
SMTP_USER=
SMTP_PASS=
NODE_ENV=production
```

**Frontend (.env)**
```
VITE_API_URL=        # Railway backend URL
```

### Railway Setup
- Two services: frontend + backend
- Shared PostgreSQL instance
- Automatic deployments from main branch
- Environment variables set in Railway dashboard

## Code Style Guidelines

### TypeScript
- Use interfaces for object shapes
- Use types for unions and primitives
- Prefer `const` over `let`
- Use optional chaining: `user?.email`
- Use nullish coalescing: `value ?? default`

### React
- Functional components only (no classes)
- Custom hooks for reusable logic
- Props interfaces for all components
- Destructure props in function signature

### Naming Conventions
- **Components**: PascalCase (UserCard.tsx)
- **Hooks**: camelCase with "use" prefix (useAuth.ts)
- **Utils**: camelCase (formatDate.ts)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Types/Interfaces**: PascalCase (User, CreateGroupDto)

### File Organization
- One component per file
- Co-locate tests: `Button.tsx` + `Button.test.tsx`
- Index files for barrel exports
- Keep files under 300 lines (split if larger)

## Common Patterns

### API Service Pattern (Frontend)

```typescript
// services/api/groups.ts
export const groupsApi = {
  async getAll(): Promise<Group[]> {
    const response = await fetch(`${API_URL}/groups`, {
      credentials: 'include',
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },

  async create(data: CreateGroupDto): Promise<Group> {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new ApiError(response);
    return response.json();
  },
};
```

### Custom Hook Pattern

```typescript
// hooks/useGroups.ts
export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    groupsApi.getAll()
      .then(setGroups)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading, error };
}
```

### Controller Pattern (Backend)

```typescript
// controllers/groupController.ts
export class GroupController {
  constructor(private groupService: GroupService) {}

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const group = await this.groupService.createGroup(userId, req.body);
      res.status(201).json(group);
    } catch (error) {
      next(error);
    }
  }
}
```

## Future Enhancements

### Phase 1 (MVP)
- Basic auth and groups
- Simple matching algorithm
- Email notifications
- Mobile-responsive UI

### Phase 2
- Wishlists and preferences
- Gift budget suggestions
- Reminder emails
- Group templates

### Phase 3
- Native mobile apps (Capacitor)
- Social features (group chat)
- Analytics dashboard
- Multi-year group management

### Phase 4
- White-label solution for organizations
- Premium features
- Advanced analytics
- API for third-party integrations

## Troubleshooting Reference

Common issues and solutions are documented in MAINTENANCE.md

## Additional Resources

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Railway Docs](https://docs.railway.app)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: 2025-11-18
**Maintained By**: Project Team
