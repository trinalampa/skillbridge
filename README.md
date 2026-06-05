# SkillBridge MERN Capstone

A capstone-level MERN stack project for student internship and job matching.

## Included Roles

- **Super Admin** - creates Admin accounts, enables/disables users, monitors system-wide statistics.
- **Admin** - verifies employers, approves job posts, and monitors platform activity.
- **Employer** - creates job posts and reviews applicants.
- **Student** - views recommended jobs, applies for jobs, and tracks applications.

## Quick Start

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
npm run dev
```

For Windows CMD, use:
```bash
copy .env.example .env
```

### 2. Frontend
Open another terminal:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```

For Windows CMD, use:
```bash
copy .env.example .env
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000

## Demo Accounts
After running backend seed:
```bash
cd server
npm run seed
```

Super Admin: superadmin@skillbridge.com / password123  
Admin: admin@skillbridge.com / password123  
Student: student@skillbridge.com / password123  
Employer: employer@skillbridge.com / password123  
Pending Employer: pendingemployer@skillbridge.com / password123

## Super Admin Notes

Public registration only allows `student` and `employer` accounts. Admin accounts must be created from the Super Admin dashboard. This makes the project more secure and better aligned with a capstone-level role-based access control design.
