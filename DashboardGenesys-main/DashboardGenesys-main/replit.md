# Genesys Dashboard

## Overview

This is a full-stack web application for analyzing Genesys contact center interaction data. The system provides a comprehensive dashboard for visualizing call center metrics, agent performance, and interaction analytics through CSV data import and real-time visualization.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React-based SPA with TypeScript using Vite as the build tool
- **Backend**: Express.js server with TypeScript providing REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for data modeling and queries
- **Development Environment**: Replit-optimized with integrated PostgreSQL and hot-reload support

### Directory Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── attached_assets/ # Static assets
```

## Key Components

### Frontend Architecture
- **Framework**: React with TypeScript and modern hooks
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Charts**: Recharts for data visualization
- **File Upload**: React Dropzone with Papa Parse for CSV processing

### Backend Architecture
- **Server Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints for CRUD operations
- **Data Validation**: Zod for runtime type checking and validation
- **Database Integration**: Drizzle ORM with PostgreSQL
- **Session Management**: Express sessions with PostgreSQL store
- **Development Tools**: Hot reload with Vite integration in development

### Database Schema
The system uses PostgreSQL with two main tables:
- **interactions**: Core interaction data (conversation ID, agent, customer, queue, duration, timestamps)
- **users**: Basic user authentication (username, password)

## Data Flow

1. **CSV Upload**: Users upload interaction data via drag-and-drop interface
2. **Data Processing**: Frontend parses CSV using Papa Parse and validates against Zod schemas
3. **API Communication**: Processed data sent to backend via REST endpoints
4. **Data Storage**: Backend validates and stores data using Drizzle ORM
5. **Real-time Updates**: TanStack Query automatically refetches data after mutations
6. **Dashboard Visualization**: Charts and metrics update reactively based on filtered data

### Key Data Transformations
- Date parsing from various formats to ISO timestamps
- Duration conversion from milliseconds to user-friendly formats
- Agent name extraction from complex user strings
- Queue name normalization and categorization

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver optimized for serverless
- **drizzle-orm**: Type-safe SQL query builder and ORM
- **@tanstack/react-query**: Server state management and caching
- **papaparse**: CSV parsing library for file uploads
- **date-fns**: Date manipulation and formatting utilities
- **recharts**: React charting library for data visualization

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant utilities
- **lucide-react**: Modern icon library

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **tsx**: TypeScript execution engine for development

## Deployment Strategy

The application is configured for Replit's autoscale deployment:

- **Build Process**: Vite builds optimized production assets
- **Production Server**: Node.js runs the Express server serving both API and static files
- **Database**: PostgreSQL 16 with automatic provisioning
- **Environment**: Production and development configurations with environment-specific optimizations

### Build Configuration
```json
{
  "build": ["npm", "run", "build"],
  "run": ["npm", "run", "start"],
  "deploymentTarget": "autoscale"
}
```

### Port Configuration
- **Development**: Port 5000 with hot reload
- **Production**: Port 80 for external access

## Recent Changes

✓ Enhanced PDF export functionality with comprehensive data tables
✓ Improved CSV export with all interaction fields
✓ Added search functionality within agent dropdown with magnifying glass icon
✓ Enhanced Recent Interactions table with all requested columns (Media Type, Users, Remote, Date, End Date, Duration, Direction, ANI, DNIS, Queue, Wrap-up, Flow, Conversation ID)
✓ Implemented advanced search and filtering within Recent Interactions table
✓ Added customizable page size options (10, 20, 50, 100 items per page)
✓ Created file management system with activate/deactivate and delete functionality
✓ Implemented file upload history with confirmation dialogs for deletion
✓ Added sidebar display of active uploaded files
✓ Made charts colorful with vibrant color schemes (blue, purple, green, yellow, red, cyan, orange, lime)
✓ Created functional navigation pages for all analysis sections:
  - Analysis by Queue: Detailed queue performance metrics and visualizations
  - Analysis by Agent: Agent performance analytics with interaction counts
  - Time Series Analysis: Hourly distribution charts and breakdown
  - Analysis by Wrap-up: Wrap-up code distribution and statistics
✓ Created Report History page with download and delete capabilities
✓ Enhanced interactions table with comprehensive filtering and search options
✓ Added bulk selection and deletion features for files and reports
✓ Fixed file persistence issue - files now properly get removed when deleted
✓ Fixed CSV upload to track multiple files and display them in file manager
✓ Fixed PDF export functionality with proper jsPDF imports
✓ Added sortable columns in Recent Interactions table with click-to-sort functionality
✓ Improved Queue Distribution chart tooltip visibility and styling
✓ Fixed Report History download functionality with proper file downloads
✓ Removed Advanced Filters feature as requested
✓ Corrected Average Duration by Queue calculations with proper error handling

## Changelog
```
Changelog:
- June 24, 2025: Major feature enhancements - PDF export, advanced search, file management, colorful charts, complete navigation system
- June 23, 2025: Initial setup
```

## User Preferences

Preferred communication style: Simple, everyday language.