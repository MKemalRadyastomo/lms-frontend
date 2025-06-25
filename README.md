# LMS Frontend - Learning Management System

A modern, responsive frontend application for a Learning Management System built with Next.js 14, TypeScript, and Tailwind CSS.

## 🚀 Features

### Authentication & Authorization

- **Secure Login/Register** with JWT token management
- **Role-based Access Control** (Student, Instructor, Admin)
- **Profile Management** with image upload support
- **Password Security** with validation requirements

### Course Management

- **Course Catalog** with search and filtering
- **Interactive Course Content** (lectures, materials, quizzes)
- **Progress Tracking** and completion status
- **Category Organization** for easy navigation

### Assignment System

- **Multiple Assignment Types**:
  - Essay submissions with rich text editor
  - File upload assignments with drag-and-drop
  - Interactive quizzes with multiple question types
- **Draft Saving** functionality
- **Deadline Management** with notifications
- **Grade Tracking** and feedback system

### Dashboard & Analytics

- **Personalized Dashboard** with role-specific content
- **Progress Analytics** and performance metrics
- **Quick Actions** for common tasks
- **Notification System** for important updates

### Modern UI/UX

- **Responsive Design** optimized for all devices
- **Dark/Light Theme** support
- **Smooth Animations** with Framer Motion
- **Accessibility** compliant (WCAG 2.1 AA)
- **Modern Components** with shadcn/ui

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages (login, register)
│   ├── (dashboard)/       # Protected dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable UI components
│   ├── ui/               # Basic UI components (shadcn/ui)
│   ├── auth/             # Authentication components
│   ├── providers/        # Context providers
│   └── ...               # Feature-specific components
├── lib/                  # Utility libraries
│   ├── api.ts           # API client configuration
│   ├── auth.ts          # Authentication utilities
│   ├── utils.ts         # General utilities
│   └── validators.ts    # Zod validation schemas
└── types/               # TypeScript type definitions
    └── index.ts         # Centralized type exports
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API server running on `http://localhost:3000`

### Installation Steps

1. **Clone and Navigate**

   ```bash
   cd url/to/github/repo
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**

   ```bash
   # .env.local is already configured with:
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🔗 API Integration

The frontend integrates with your existing LMS backend API:

### Authentication Endpoints

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Core Features

- **User Management** - Full CRUD operations
- **Course Management** - Browse, create, and manage courses
- **Assignment System** - Submit essays, files, and quizzes
- **Role Management** - Admin panel for user roles
- **File Uploads** - Profile pictures and assignment files

### API Client Features

- **Automatic Token Management** - JWT tokens handled automatically
- **Request/Response Interceptors** - Error handling and auth
- **Type Safety** - Full TypeScript integration
- **Error Handling** - Comprehensive error management

## 👥 User Roles & Permissions

### Student

- Browse and enroll in courses
- Access course content and materials
- Submit assignments (essays, files, quizzes)
- Track progress and view grades
- Manage personal profile

### Instructor

- Create and manage courses
- Add course content (lectures, materials, quizzes)
- Create and grade assignments
- View student submissions
- Manage course enrollments

### Administrator

- Full system access and management
- User account management and role assignment
- Course approval and oversight
- System analytics and reporting
- Bulk operations and data management

## 🎨 Design System

### Color Palette

- **Primary**: Blue (#2563EB) - Actions, links, highlights
- **Secondary**: Purple (#7C3AED) - Accents, gradients
- **Success**: Green (#059669) - Positive actions, completion
- **Warning**: Orange (#EA580C) - Deadlines, attention
- **Danger**: Red (#DC2626) - Errors, deletion

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400)
- **Small Text**: Medium weight (500)

### Components

- **Cards**: Subtle shadows with rounded corners
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Forms**: Comprehensive validation with error states
- **Navigation**: Responsive sidebar with mobile overlay

## 🔒 Security Features

### Authentication Security

- **JWT Token Management** with secure cookie storage
- **Automatic Token Refresh** to maintain sessions
- **Route Protection** with authentication guards
- **Role-based Access Control** for sensitive areas

### Data Protection

- **Input Validation** with Zod schemas
- **XSS Prevention** with sanitized inputs
- **CSRF Protection** with token validation
- **Secure File Uploads** with type and size validation

### Privacy

- **Minimal Data Storage** in browser
- **Secure API Communication** with HTTPS
- **User Data Protection** following best practices

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px - Stack layout, touch-optimized
- **Tablet**: 768px - 1024px - Responsive grid, adaptive navigation
- **Desktop**: > 1024px - Full sidebar, multi-column layouts

### Mobile Features

- **Touch-friendly** buttons and interactions
- **Swipe Navigation** for mobile users
- **Optimized Forms** with proper input types
- **Progressive Enhancement** for different screen sizes

## ⚡ Performance Optimizations

### Next.js Features

- **App Router** for optimal performance
- **Server Components** where applicable
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster page loads

### Data Management

- **React Query** for efficient API caching
- **Optimistic Updates** for better UX
- **Background Refetching** for fresh data
- **Error Boundaries** for graceful error handling

### Bundle Optimization

- **Tree Shaking** to remove unused code
- **Dynamic Imports** for route-based splitting
- **Asset Optimization** for faster loading

## 🧪 Development Workflow

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Production server
npm run start

# Linting
npm run lint

# Type checking
npm run type-check
```

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for code formatting (recommended)
- **Husky** for git hooks (can be added)

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

```bash
# Production
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api/v1
NODE_ENV=production
```

### Deployment Platforms

- **Vercel** (Recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Docker** containers

## 🤝 Contributing

### Development Guidelines

1. **Component Structure**: Use the established patterns
2. **Type Safety**: Always use TypeScript types
3. **Error Handling**: Implement proper error boundaries
4. **Accessibility**: Follow WCAG guidelines
5. **Performance**: Consider bundle size and loading times

### Adding New Features

1. **API Integration**: Add to `lib/api.ts`
2. **Type Definitions**: Update `types/index.ts`
3. **Validation**: Create Zod schemas in `lib/validators.ts`
4. **Components**: Follow the component structure
5. **Pages**: Use appropriate layouts and error handling

## 📚 Key Dependencies

### Core Framework

- `next@14.0.4` - React framework
- `react@^18.2.0` - UI library
- `typescript@^5.3.3` - Type safety

### Styling & UI

- `tailwindcss@^3.3.6` - Utility-first CSS
- `@radix-ui/*` - Accessible UI primitives
- `lucide-react@^0.303.0` - Icon library
- `framer-motion@^10.16.16` - Animations

### Data & Forms

- `@tanstack/react-query@^5.15.5` - Server state management
- `react-hook-form@^7.48.2` - Form handling
- `zod@^3.22.4` - Schema validation
- `axios@^1.6.2` - HTTP client

## 🐛 Troubleshooting

### Common Issues

**Authentication Issues**

- Check if backend API is running on `localhost:3000`
- Verify JWT tokens in browser cookies
- Ensure user roles are properly configured

**API Connection Issues**

- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check CORS configuration on backend
- Inspect network requests in browser dev tools

**Build Issues**

- Run `npm run type-check` to identify TypeScript errors
- Clear `.next` folder and rebuild
- Check for missing dependencies

### Getting Help

- Check browser console for error messages
- Review network tab for API request/response details
- Verify backend API is accessible and returning expected data

## 📈 Future Enhancements

### Planned Features

- **Real-time Notifications** with WebSocket integration
- **Offline Support** with PWA capabilities
- **Advanced Analytics** dashboard for instructors
- **Video Conferencing** integration for live classes
- **Mobile App** with React Native

### Technical Improvements

- **End-to-End Testing** with Playwright
- **Component Testing** with Jest and Testing Library
- **Performance Monitoring** with analytics
- **SEO Optimization** for public pages

---

## 📞 Support

For questions, issues, or contributions, please refer to the project documentation or contact the development team.

**Happy Learning! 🎓**
