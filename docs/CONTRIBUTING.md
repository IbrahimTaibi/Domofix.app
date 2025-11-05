# Contributing to Darigo

Welcome to the Darigo project! This guide will help you understand our development workflow, coding standards, and contribution process.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Code Review Process](#code-review-process)
- [Issue Management](#issue-management)
- [Release Process](#release-process)

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 18.17+ and npm/yarn
- **MongoDB** (local or Atlas connection)
- **Git** with proper configuration
- **VS Code** (recommended) with suggested extensions

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/darigo.git
   cd darigo
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm install
   
   # Or using yarn
   yarn install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment files
   cp apps/backend/.env.example apps/backend/.env
   cp apps/frontend/.env.example apps/frontend/.env.local
   
   # Configure your environment variables
   ```

4. **Database Setup**
   ```bash
   # Start local MongoDB (if using local setup)
   mongod
   
   # Or configure MongoDB Atlas connection in .env
   ```

5. **Start Development Servers**
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend
   npm run dev:backend
   ```

---

## Development Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Critical production fixes
- `release/*`: Release preparation

### Feature Development

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development Process**
   - Write code following our standards
   - Add tests for new functionality
   - Update documentation if needed
   - Commit changes with descriptive messages

3. **Testing**
   ```bash
   # Run all tests
   npm test
   
   # Run specific test suites
   npm run test:frontend
   npm run test:backend
   npm run test:e2e
   ```

4. **Code Quality Checks**
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   
   # Type checking
   npm run type-check
   ```

### Monorepo Structure

Our project uses a monorepo structure with the following workspaces:

```
darigo/
├── apps/
│   ├── frontend/          # Next.js application
│   └── backend/           # NestJS application
├── packages/
│   ├── shared/            # Shared utilities and types
│   └── ui/                # Shared UI components (future)
├── docs/                  # Documentation
└── tools/                 # Build tools and scripts
```

### Package Management

- Use `npm workspaces` for dependency management
- Install dependencies at the root level when possible
- Use specific workspace commands for app-specific dependencies

```bash
# Install dependency for frontend
npm install --workspace=apps/frontend package-name

# Install dependency for backend
npm install --workspace=apps/backend package-name

# Install shared dependency
npm install package-name
```

---

## Coding Standards

### TypeScript Guidelines

1. **Strict Mode**: Always use TypeScript strict mode
2. **Type Definitions**: Prefer interfaces over types for object shapes
3. **Naming Conventions**:
   - Interfaces: `PascalCase` with `I` prefix (e.g., `IUserData`)
   - Types: `PascalCase` (e.g., `UserRole`)
   - Enums: `PascalCase` (e.g., `UserStatus`)
   - Variables/Functions: `camelCase`
   - Constants: `UPPER_SNAKE_CASE`

```typescript
// ✅ Good
interface IUser {
  id: string
  email: string
  role: UserRole
}

type UserRole = 'customer' | 'provider' | 'admin'

enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended'
}

// ❌ Bad
interface user {
  ID: string
  Email: string
}
```

### Frontend Standards (Next.js/React)

#### Component Structure

```tsx
// 1. Imports (external first, then internal)
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components'
import { useAuth } from '@/shared/hooks'

// 2. Types/Interfaces
interface ComponentProps {
  title: string
  isVisible?: boolean
  onClose?: () => void
}

// 3. Component
const Component: React.FC<ComponentProps> = ({
  title,
  isVisible = true,
  onClose
}) => {
  // 4. Hooks and state
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [])

  // 6. Event handlers
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      // Handle submission
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // 7. Early returns
  if (!isVisible) return null

  // 8. Render
  return (
    <div className="component-container">
      <h1>{title}</h1>
      <Button onClick={handleSubmit} isLoading={isLoading}>
        Submit
      </Button>
    </div>
  )
}

export default Component
```

#### Styling Guidelines

1. **Tailwind CSS**: Use utility classes primarily
2. **Custom CSS**: Only when Tailwind is insufficient
3. **Responsive Design**: Mobile-first approach
4. **Naming**: Use semantic class names for custom CSS

```tsx
// ✅ Good
<div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
  <Button variant="primary" size="lg">
    Primary Action
  </Button>
</div>

// ❌ Bad
<div style={{ display: 'flex', flexDirection: 'column' }}>
  <button className="btn-blue">Click me</button>
</div>
```

### Backend Standards (NestJS)

#### Module Structure

```typescript
// user.module.ts
import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { User, UserSchema } from './schemas/user.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
```

#### Controller Guidelines

```typescript
// user.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpException
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserService } from './user.service'
import { CreateUserDto, UpdateUserDto } from './dto'

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll() {
    try {
      return await this.userService.findAll()
    } catch (error) {
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto)
  }
}
```

#### Service Guidelines

```typescript
// user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema'
import { CreateUserDto, UpdateUserDto } from './dto'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto)
    return createdUser.save()
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec()
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec()
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }
}
```

### Database Guidelines

#### Schema Design

```typescript
// user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'

export type UserDocument = User & Document

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string

  @Prop({ required: true })
  password: string

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ default: 'customer' })
  role: string

  @Prop({ default: 'active' })
  status: string
}

export const UserSchema = SchemaFactory.createForClass(User)

// Add indexes
UserSchema.index({ email: 1 })
UserSchema.index({ role: 1, status: 1 })
```

---

## Git Workflow

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality
fix(ui): resolve button alignment issue on mobile
docs: update API documentation
test(user): add unit tests for user service
```

### Branch Naming

- `feature/auth-system`
- `bugfix/login-validation`
- `hotfix/security-patch`
- `release/v1.2.0`

### Pre-commit Hooks

We use Husky for pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

---

## Pull Request Process

### Before Creating a PR

1. **Sync with develop**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Run Quality Checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Update Documentation**
   - Update relevant documentation
   - Add/update tests
   - Update CHANGELOG.md if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. **Automated Checks**: All CI checks must pass
2. **Code Review**: At least one approval required
3. **Testing**: Manual testing if needed
4. **Merge**: Squash and merge to develop

---

## Testing Guidelines

### Testing Strategy

1. **Unit Tests**: Individual functions and components
2. **Integration Tests**: API endpoints and database operations
3. **E2E Tests**: Critical user flows
4. **Visual Tests**: Component snapshots

### Frontend Testing

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from './button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('shows loading state', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})
```

### Backend Testing

```typescript
// Service test example
import { Test, TestingModule } from '@nestjs/testing'
import { getModelToken } from '@nestjs/mongoose'
import { UserService } from './user.service'
import { User } from './schemas/user.schema'

describe('UserService', () => {
  let service: UserService
  let mockUserModel: any

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      save: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile()

    service = module.get<UserService>(UserService)
  })

  it('should find all users', async () => {
    const users = [{ id: '1', email: 'test@example.com' }]
    mockUserModel.find.mockReturnValue({
      exec: jest.fn().mockResolvedValue(users)
    })

    const result = await service.findAll()
    expect(result).toEqual(users)
  })
})
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test user.service.spec.ts

# Run E2E tests
npm run test:e2e
```

---

## Code Review Process

### Review Checklist

#### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Performance considerations

#### Code Quality
- [ ] Code is readable and maintainable
- [ ] Follows project conventions
- [ ] No code duplication
- [ ] Proper abstractions

#### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] Tests pass consistently

#### Security
- [ ] No sensitive data exposed
- [ ] Input validation present
- [ ] Authentication/authorization correct

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] API documentation updated

### Review Guidelines

1. **Be Constructive**: Provide helpful feedback
2. **Be Specific**: Point out exact issues
3. **Suggest Solutions**: Don't just identify problems
4. **Ask Questions**: Clarify unclear code
5. **Approve When Ready**: Don't hold up good code

---

## Issue Management

### Issue Types

- **Bug**: Something isn't working
- **Feature**: New functionality
- **Enhancement**: Improvement to existing feature
- **Documentation**: Documentation needs
- **Question**: Need clarification

### Issue Template

```markdown
## Description
Clear description of the issue

## Steps to Reproduce (for bugs)
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 91]
- Version: [e.g., 1.2.0]

## Additional Context
Screenshots, logs, etc.
```

### Labels

- `bug`: Bug reports
- `feature`: New features
- `enhancement`: Improvements
- `documentation`: Documentation
- `good first issue`: Good for newcomers
- `help wanted`: Need community help
- `priority:high`: High priority
- `priority:medium`: Medium priority
- `priority:low`: Low priority

---

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Create Release Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b release/v1.2.0
   ```

2. **Update Version**
   ```bash
   npm version minor  # or major/patch
   ```

3. **Update Changelog**
   - Add new version section
   - List all changes since last release

4. **Final Testing**
   ```bash
   npm run test
   npm run build
   npm run test:e2e
   ```

5. **Create PR to Main**
   - Review and merge release branch
   - Create GitHub release with tag

6. **Deploy to Production**
   - Automated deployment via CI/CD
   - Monitor for issues

7. **Merge Back to Develop**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

---

## Development Tools

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

### Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "npm run lint --workspaces",
    "format": "prettier --write .",
    "type-check": "npm run type-check --workspaces"
  }
}
```

---

## Getting Help

### Resources

- **Documentation**: Check `/docs` folder
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for help in PR comments

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code-specific discussions
- **Commit Messages**: Clear, descriptive messages

---

## License

By contributing to Darigo, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to Darigo! Your efforts help make this platform better for everyone.