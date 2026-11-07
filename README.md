# COLLEGEFINDER – SaaS-Based College Discovery & Admissions Platform

A complete, production-ready MERN Stack SaaS application specifically engineered for Telangana State B.Tech colleges discovery, cutoffs, tuition transparent verification, side-by-side comparison, and direct admissions management.

---

## 🏛️ Project Highlights & Features

- **Three Role-Based Dashboards**:
  - **👑 Super Admin**: Full platform governance, college approvals & verification status toggles, user activation/deactivation, SaaS subscription plan management, and tamper-evident audit logs.
  - **🏫 College Admin**: College profile management, course CRUD with subscription branch allowances, incoming student admission enquiry processing, and SaaS growth plan upgrades.
  - **🎓 Student / User**: Real-time multi-filtered college search across Telangana districts, side-by-side comparison matrix (up to 3 colleges), wishlist bookmarking, direct admission inquiries, and authentic reviews.
- **Authentic Telangana B.Tech Dataset**:
  - Pre-seeded with genuine records including **Vignan Institute of Technology & Sciences (VGNT)**, JNTUH UCESTH, Osmania University CE, CBIT, Vasavi College of Engineering, VNR VJIET, GRIET, CVR College of Engineering, Vardhaman, and Anurag University.
  - Verified badges, exact districts (Yadadri Bhuvanagiri, Hyderabad, Rangareddy, Medchal-Malkajgiri), affiliations (JNTUH, OU, Autonomous), tuition fees, and audited placement records.
- **Strict Architecture Compliance**:
  - **Pure JavaScript** (No TypeScript).
  - **Native Fetch API** (No Axios).
  - **100% Separate JSX and CSS Files** for every page and reusable component.
  - **Zero inline CSS**.
  - **College-Level Data Isolation** enforced at database and API layers.

---

## 🔐 Default Demo Accounts

Use the **1-Click Quick Fill** buttons on the `/login` page or log in with these credentials:

| Role | Email Address | Password | Assigned Scope |
| :--- | :--- | :--- | :--- |
| **👑 Super Admin** | `admin@collegefinder.com` | `Admin@123` | Full Platform Governance |
| **🏫 College Admin** | `vgnt.admin@collegefinder.com` | `College@123` | **Vignan Institute of Tech & Sciences (VGNT)** |
| **🎓 Student** | `student@collegefinder.com` | `Student@123` | Student Portal, Inquiries & Wishlist |

---

## 📦 Project Structure

```
CollegeFinder-SaaS/
├── backend/
│   ├── config/
│   │   └── db.js                        # Mongoose MongoDB connection
│   ├── controllers/
│   │   ├── analyticsController.js       # Super Admin & College Admin analytics
│   │   ├── authController.js            # JWT login, register, profile update
│   │   ├── categoryController.js        # Academic categories
│   │   ├── collegeController.js         # College search, multi-filter, CRUD, verification
│   │   ├── courseController.js          # Course CRUD & SaaS plan quota validation
│   │   ├── enquiryController.js         # Student enquiries & college isolation responses
│   │   ├── reviewController.js          # Student review submissions & moderation
│   │   ├── subscriptionController.js    # SaaS plans & college upgrades
│   │   ├── userController.js            # User management & account deactivation
│   │   └── wishlistController.js        # Student college bookmarking
│   ├── data/
│   │   └── telanganaColleges.json       # Official Telangana B.Tech dataset with VGNT
│   ├── middleware/
│   │   ├── auth.js                      # Protect, authorize, college isolation checks
│   │   └── error.js                     # Centralized error handler
│   ├── models/
│   │   ├── ActivityLog.js               # Audit activity log model
│   │   ├── Category.js                  # Category model
│   │   ├── College.js                   # College model with Telangana parameters
│   │   ├── CollegeAdmin.js              # Admin mapping model
│   │   ├── Course.js                    # B.Tech course model
│   │   ├── Enquiry.js                   # Admission enquiry model
│   │   ├── Notification.js              # In-app notifications
│   │   ├── Review.js                    # Rating & review model
│   │   ├── Subscription.js              # College subscription ledger
│   │   ├── SubscriptionPlan.js          # SaaS pricing plans (Free, Growth, Enterprise)
│   │   ├── User.js                      # User model with bcryptjs & JWT
│   │   └── Wishlist.js                  # Student saved colleges model
│   ├── routes/                          # Express REST API routes
│   ├── utils/
│   │   └── logger.js                    # System activity logger
│   ├── .env                             # Backend environment variables
│   ├── package.json
│   ├── seeder.js                        # Seeds default users, plans, and dataset
│   └── server.js                        # Express server entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/                  # Reusable components (JSX + CSS pair)
│   │   │   ├── Badge.jsx & Badge.css
│   │   │   ├── CollegeCard.jsx & CollegeCard.css
│   │   │   ├── Footer.jsx & Footer.css
│   │   │   ├── Modal.jsx & Modal.css
│   │   │   ├── Navbar.jsx & Navbar.css
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── Sidebar.jsx & Sidebar.css
│   │   │   └── StatsCard.jsx & StatsCard.css
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # React Auth Context
│   │   ├── pages/                       # Dedicated JSX & CSS for EVERY page
│   │   │   ├── CollegeAdminDashboard.jsx & CollegeAdminDashboard.css
│   │   │   ├── CollegeDetails.jsx & CollegeDetails.css
│   │   │   ├── CollegeProfileManager.jsx & CollegeProfileManager.css
│   │   │   ├── Colleges.jsx & Colleges.css
│   │   │   ├── CollegeSubscription.jsx & CollegeSubscription.css
│   │   │   ├── CompareColleges.jsx & CompareColleges.css
│   │   │   ├── Home.jsx & Home.css
│   │   │   ├── Login.jsx & Login.css
│   │   │   ├── ManageColleges.jsx & ManageColleges.css
│   │   │   ├── ManageCourses.jsx & ManageCourses.css
│   │   │   ├── ManageEnquiries.jsx & ManageEnquiries.css
│   │   │   ├── ManageSubscriptions.jsx & ManageSubscriptions.css
│   │   │   ├── ManageUsers.jsx & ManageUsers.css
│   │   │   ├── PlatformAnalytics.jsx & PlatformAnalytics.css
│   │   │   ├── Register.jsx & Register.css
│   │   │   └── StudentDashboard.jsx & StudentDashboard.css
│   │   ├── utils/
│   │   │   └── api.js                   # Native fetch() API client
│   │   ├── App.jsx & App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── package.json                         # Root orchestration scripts
└── README.md
```

---

## 🚀 Running the Project

### 1. Database Connection String
Open `backend/.env` and ensure `MONGODB_URI` points to your MongoDB instance (local or MongoDB Atlas):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/collegefinder
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/collegefinder?retryWrites=true&w=majority
```

### 2. Import Seed Dataset into MongoDB
Run the seeder script to populate default users, SaaS plans, and Telangana colleges (including Vignan VGNT):
```bash
npm run seed
```

### 3. Start Backend Server
```bash
npm run backend
# Server runs at http://localhost:5000
```

### 4. Start Frontend Application
In a second terminal:
```bash
npm run frontend
# Vite React app runs at http://localhost:5173
```

