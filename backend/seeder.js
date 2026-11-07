const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');
const College = require('./models/College');
const CollegeAdmin = require('./models/CollegeAdmin');
const Course = require('./models/Course');
const Enquiry = require('./models/Enquiry');
const SubscriptionPlan = require('./models/SubscriptionPlan');
const Subscription = require('./models/Subscription');
const Wishlist = require('./models/Wishlist');
const Review = require('./models/Review');
const Category = require('./models/Category');
const Notification = require('./models/Notification');
const ActivityLog = require('./models/ActivityLog');

const { connectDB } = require('./config/db');

const seedData = async () => {
  try {
    console.log('[Seeder] Connecting to database...');
    await connectDB();

    console.log('[Seeder] Cleaning existing collections...');
    await Promise.all([
      User.deleteMany(),
      College.deleteMany(),
      CollegeAdmin.deleteMany(),
      Course.deleteMany(),
      Enquiry.deleteMany(),
      SubscriptionPlan.deleteMany(),
      Subscription.deleteMany(),
      Wishlist.deleteMany(),
      Review.deleteMany(),
      Category.deleteMany(),
      Notification.deleteMany(),
      ActivityLog.deleteMany(),
    ]);

    console.log('[Seeder] Seeding default Categories...');
    const categories = await Category.create([
      { name: 'Engineering', slug: 'engineering', description: 'Undergraduate and postgraduate engineering programs', icon: 'Cpu' },
      { name: 'Computer Science & AI', slug: 'computer-science-ai', description: 'AI, ML, Data Science & Cybersecurity specializations', icon: 'Brain' },
      { name: 'Electronics & VLSI', slug: 'electronics-vlsi', description: 'Microelectronics, Embedded Systems & Communication', icon: 'Radio' },
      { name: 'Management', slug: 'management', description: 'MBA, Technology Management and Business Systems', icon: 'Briefcase' },
    ]);

    console.log('[Seeder] Seeding SaaS Subscription Plans...');
    const planStarter = await SubscriptionPlan.create({
      name: 'Free Starter',
      code: 'free_starter',
      price: 0,
      billingCycle: 'Yearly',
      durationInDays: 365,
      maxCourses: 5,
      featuredListing: false,
      analyticsAccess: false,
      prioritySupport: false,
      verifiedBadge: false,
      directEnquiryAlerts: true,
      description: 'Ideal for small colleges starting out on CollegeFinder.',
      features: [
        'List up to 5 B.Tech branches',
        'Receive student admission enquiries',
        'Standard directory search presence',
        'Basic contact profile',
      ],
    });

    const planGrowth = await SubscriptionPlan.create({
      name: 'Growth Pro',
      code: 'growth_pro',
      price: 4999,
      billingCycle: 'Yearly',
      durationInDays: 365,
      maxCourses: 15,
      featuredListing: true,
      analyticsAccess: true,
      prioritySupport: false,
      verifiedBadge: true,
      directEnquiryAlerts: true,
      description: 'Most popular plan for established accredited colleges.',
      features: [
        'List up to 15 courses & specializations',
        'Official Verified Institute Badge',
        'Featured placement on homepage & search',
        'In-depth enquiry analytics & reporting',
        'Direct admission lead alerts',
      ],
    });

    const planEnterprise = await SubscriptionPlan.create({
      name: 'Enterprise Elite',
      code: 'enterprise_elite',
      price: 12999,
      billingCycle: 'Yearly',
      durationInDays: 365,
      maxCourses: 50,
      featuredListing: true,
      analyticsAccess: true,
      prioritySupport: true,
      verifiedBadge: true,
      directEnquiryAlerts: true,
      description: 'For premier universities requiring limitless scale & VIP spotlight.',
      features: [
        'Unlimited courses and branches',
        'Top-tier priority featured ranking',
        'Dedicated account manager & support',
        'Real-time student enquiry exports',
        'Branded college profile banner and media galleries',
      ],
    });

    console.log('[Seeder] Seeding Default Users (Super Admin, College Admin, Student)...');
    // 1. Super Admin
    const superAdmin = await User.create({
      name: 'Platform Super Admin',
      email: 'admin@collegefinder.com',
      password: 'Admin@123',
      role: 'super_admin',
      phone: '+91 98765 43210',
    });

    // 2. Demo Student
    const studentUser = await User.create({
      name: 'Rahul Sharma',
      email: 'student@collegefinder.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 91234 56789',
    });

    // 3. College Admin for VGNT
    const vgntAdmin = await User.create({
      name: 'VGNT Admissions Dean',
      email: 'vgnt.admin@collegefinder.com',
      password: 'College@123',
      role: 'college_admin',
      phone: '+91 86852 26128',
    });

    console.log('[Seeder] Importing Telangana B.Tech College Dataset...');
    const rawData = fs.readFileSync(path.join(__dirname, 'data', 'telanganaColleges.json'), 'utf-8');
    const collegesList = JSON.parse(rawData);

    let vgntCollegeId = null;

    for (const item of collegesList) {
      const coursesData = item.courses || [];
      const collegePayload = { ...item };
      delete collegePayload.courses;

      // Ensure VGNT is assigned to the VGNT College Admin
      if (item.code === 'VGNT') {
        collegePayload.collegeAdmin = vgntAdmin._id;
      }

      const college = await College.create(collegePayload);

      if (item.code === 'VGNT') {
        vgntCollegeId = college._id;
        vgntAdmin.collegeId = college._id;
        await vgntAdmin.save();

        // Create CollegeAdmin mapping record
        await CollegeAdmin.create({
          user: vgntAdmin._id,
          college: college._id,
          designation: 'Dean of Admissions & Academic Relations',
        });

        // Grant active Growth Pro subscription to VGNT
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        await Subscription.create({
          college: college._id,
          plan: planGrowth._id,
          startDate,
          endDate,
          status: 'active',
          amountPaid: planGrowth.price,
          paymentStatus: 'completed',
        });
      }

      // Seed Courses for this college
      if (coursesData.length > 0) {
        const preparedCourses = coursesData.map((c) => ({
          ...c,
          college: college._id,
        }));
        await Course.insertMany(preparedCourses);
      }
    }

    console.log('[Seeder] Seeding initial Student Interactions (Wishlist, Reviews, Enquiries)...');
    if (vgntCollegeId) {
      // Add VGNT to student wishlist
      await Wishlist.create({
        user: studentUser._id,
        college: vgntCollegeId,
      });

      // Add student review for VGNT
      await Review.create({
        college: vgntCollegeId,
        user: studentUser._id,
        rating: 5,
        title: 'Outstanding campus culture, cutting-edge labs, and supportive faculty',
        comment: 'Vignan Institute of Technology & Sciences offers an incredible technical atmosphere. The CSE faculty and training for TS EAMCET students is top notch with excellent placement packages.',
        status: 'approved',
      });

      // Find first course of VGNT for enquiry
      const vgntCourse = await Course.findOne({ college: vgntCollegeId, specialization: 'Core CSE' });

      // Add sample admission enquiry
      await Enquiry.create({
        college: vgntCollegeId,
        student: studentUser._id,
        course: vgntCourse ? vgntCourse._id : null,
        name: studentUser.name,
        email: studentUser.email,
        phone: studentUser.phone,
        eamcetRank: '14250',
        message: 'Interested in B.Tech CSE seat under Convenor Quota. Could you please share the fee payment schedule and hostel availability?',
        status: 'pending',
      });
    }

    // Seed initial Activity Logs
    await ActivityLog.create([
      {
        user: superAdmin._id,
        userName: superAdmin.name,
        userRole: 'super_admin',
        action: 'SYSTEM_INITIALIZED',
        targetType: 'System',
        details: { message: 'CollegeFinder SaaS platform dataset imported and initialized successfully.' },
      },
      {
        user: vgntAdmin._id,
        userName: vgntAdmin.name,
        userRole: 'college_admin',
        action: 'COLLEGE_CLAIMED',
        targetType: 'College',
        targetId: vgntCollegeId ? vgntCollegeId.toString() : '',
        details: { collegeName: 'Vignan Institute of Technology and Science' },
      },
    ]);

    console.log('================================================================');
    console.log('✅ COLLEGEFINDER SEEDING COMPLETED SUCCESSFULLY!');
    console.log('================================================================');
    console.log('DEFAULT LOGINS:');
    console.log('👑 Super Admin   : admin@collegefinder.com      / Admin@123');
    console.log('🏫 College Admin : vgnt.admin@collegefinder.com / College@123 (VGNT)');
    console.log('🎓 Student User  : student@collegefinder.com    / Student@123');
    console.log('================================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder Error:', error);
    process.exit(1);
  }
};

seedData();

