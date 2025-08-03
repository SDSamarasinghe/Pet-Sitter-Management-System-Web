# Flying Duchess Pet-Sitting System - Frontend

A comprehensive Next.js frontend application for managing in-home pet care services in Toronto. Built with Next.js 14, TypeScript, Tailwind CSS, and Shadcn/ui components.

## Features

### Client Features
- **User Authentication**: Secure login with JWT tokens
- **Pet Management**: Add pets with photos, care instructions, and details
- **Service Booking**: Schedule pet-sitting services with date/time selection
- **Reports Viewing**: View detailed sitter reports with photos and activities
- **Profile Management**: Update contact information and emergency contacts

### Admin Features
- **User Management**: View all users and their roles
- **Booking Management**: Assign sitters and update booking statuses
- **Address Change Approval**: Review and approve client address changes
- **System Overview**: Monitor all platform activities

### Sitter Features
- **Booking Dashboard**: View assigned bookings with client and pet details
- **Service Reports**: Submit detailed reports with photos and activities
- **Status Updates**: Update booking progress and completion status

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Shadcn/ui components
- **HTTP Client**: Axios for API communication
- **Image Upload**: Cloudinary integration
- **Authentication**: JWT-based authentication

## Project Structure

```
Pet-Sitter-Management-System-Web/
├── app/                          # Next.js App Router pages
│   ├── admin/                    # Admin dashboard
│   ├── bookings/                 # Booking management
│   ├── dashboard/                # Main user dashboard
│   ├── login/                    # Authentication
│   ├── pets/
│   │   └── add/                  # Add new pets
│   ├── reports/                  # View sitter reports
│   ├── sitter/                   # Sitter dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page (redirects)
├── components/
│   └── ui/                       # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── textarea.tsx
├── lib/                          # Utility functions
│   ├── api.ts                    # Axios configuration
│   ├── auth.ts                   # Authentication utilities
│   ├── cloudinary.ts             # Image upload utilities
│   └── utils.ts                  # General utilities
├── .env.local                    # Environment variables
├── next.config.mjs               # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── components.json               # Shadcn/ui configuration
└── package.json                  # Dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Access to a NestJS backend API running on `http://localhost:3000`
- Cloudinary account for image uploads

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file with:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

### 3. Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your cloud name from the dashboard
3. Create an unsigned upload preset:
   - Go to Settings → Upload → Upload presets
   - Create a new unsigned preset
   - Note the preset name for your environment variables

### 4. Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`

### 5. Build for Production

```bash
npm run build
npm start
```

## Key Features Implementation

### Authentication Flow
- JWT tokens stored in localStorage
- Automatic token attachment to API requests
- Route protection based on authentication status
- Role-based access control (Client, Admin, Sitter)

### Image Upload
- Client-side Cloudinary integration
- Unsigned upload preset for security
- Automatic image optimization and CDN delivery
- Support for multiple image formats

### Responsive Design
- Mobile-first approach using Tailwind CSS
- Shadcn/ui components for consistent styling
- Accessible form controls with proper labels
- Responsive grid layouts for different screen sizes

### API Integration
- Centralized Axios configuration with interceptors
- Automatic error handling and user-friendly messages
- Loading states and success notifications
- Retry logic for failed requests

## User Stories Implementation

### Client Stories
✅ **Login and Authentication**
- Secure login form with email/password
- JWT token management
- Automatic redirect to dashboard

✅ **Pet Management**
- Add pets with photos via Cloudinary
- Detailed pet information forms
- Care instructions and emergency details

✅ **Service Booking**
- Date and time selection
- Service type options
- Pet selection for bookings
- Special instructions field

✅ **Report Viewing**
- Detailed sitter reports with photos
- Activity logs and care details
- Medication and feeding records

### Admin Stories
✅ **User Management**
- View all platform users
- Role-based user filtering
- User status monitoring

✅ **Booking Management**
- Assign sitters to bookings
- Update booking statuses
- Monitor booking progress

✅ **Address Change Approval**
- Review pending address changes
- Approve or reject requests
- Notification system

### Sitter Stories
✅ **Booking Dashboard**
- View assigned bookings
- Client and pet information
- Emergency contact details

✅ **Service Reports**
- Submit detailed activity reports
- Upload photos of pets
- Record feeding and medication times

✅ **Status Updates**
- Update booking progress
- Mark services as complete
- Real-time status communication

## API Endpoints Expected

The frontend expects the following backend endpoints:

### Authentication
- `POST /auth/login` - User login
- `GET /users/profile` - Get user profile

### Pets
- `GET /pets` - Get user's pets
- `POST /pets` - Add new pet

### Bookings
- `GET /bookings` - Get user's bookings
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id/status` - Update booking status

### Reports
- `GET /reports` - Get sitter reports
- `POST /sitter/reports` - Submit sitter report

### Admin
- `GET /admin/users` - Get all users
- `GET /admin/bookings` - Get all bookings
- `POST /admin/users/:id/approve-address` - Approve address change
- `PATCH /admin/bookings/:id/assign` - Assign sitter

### Sitter
- `GET /sitter/bookings` - Get assigned bookings
- `PATCH /sitter/bookings/:id/status` - Update booking status

## Development Notes

### Type Safety
- Full TypeScript implementation
- Interface definitions for all data structures
- Type-safe API responses and form handling

### Error Handling
- Global error interceptors in Axios
- User-friendly error messages
- Fallback UI for error states

### Performance
- Next.js App Router for optimal performance
- Image optimization through Next.js and Cloudinary
- Lazy loading for large datasets

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast design

## Testing

Run the development server and test the following flows:

1. **Login Flow**: Test authentication with valid/invalid credentials
2. **Pet Addition**: Add pets with photos via Cloudinary
3. **Booking Creation**: Create bookings with multiple pets
4. **Report Viewing**: View detailed sitter reports
5. **Admin Functions**: Test user management and booking assignment
6. **Sitter Functions**: Test report submission and status updates

## Troubleshooting

### Common Issues

1. **Cloudinary Upload Errors**
   - Verify cloud name and upload preset are correct
   - Check CORS settings in Cloudinary dashboard
   - Ensure unsigned preset is properly configured

2. **API Connection Issues**
   - Verify backend is running on `http://localhost:3000`
   - Check CORS configuration on backend
   - Confirm API endpoints match expected structure

3. **Authentication Issues**
   - Clear localStorage if experiencing token issues
   - Verify JWT token format and expiration
   - Check API base URL configuration

4. **Build Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check TypeScript configuration
   - Verify all environment variables are set

## Contributing

1. Follow the existing code structure and naming conventions
2. Add TypeScript types for all new features
3. Include error handling for all API calls
4. Test responsive design on multiple screen sizes
5. Ensure accessibility standards are maintained

## License

This project is part of the Flying Duchess Pet-Sitting System and is proprietary software.
