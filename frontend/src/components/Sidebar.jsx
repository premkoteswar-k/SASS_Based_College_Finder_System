import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  BookOpen,
  Mail,
  Award,
  Heart,
  GitCompare,
  Compass,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  const superAdminLinks = [
    { to: '/super-admin/dashboard', label: 'Platform Overview', icon: LayoutDashboard },
    { to: '/super-admin/colleges', label: 'Manage Colleges', icon: Building2 },
    { to: '/super-admin/users', label: 'Manage Users', icon: Users },
    { to: '/super-admin/subscriptions', label: 'SaaS Subscriptions', icon: CreditCard },
    { to: '/super-admin/analytics', label: 'Analytics & Logs', icon: BarChart3 },
  ];

  const collegeAdminLinks = [
    { to: '/college-admin/dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { to: '/college-admin/profile', label: 'College Profile', icon: Building2 },
    { to: '/college-admin/courses', label: 'Manage Courses', icon: BookOpen },
    { to: '/college-admin/enquiries', label: 'Student Enquiries', icon: Mail },
    { to: '/college-admin/subscription', label: 'My Subscription', icon: Award },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Applications', icon: LayoutDashboard },
    { to: '/student/wishlist', label: 'Saved Wishlist', icon: Heart },
    { to: '/colleges', label: 'Explore Colleges', icon: Compass },
    { to: '/compare', label: 'Compare Colleges', icon: GitCompare },
  ];

  const links =
    user.role === 'super_admin'
      ? superAdminLinks
      : user.role === 'college_admin'
      ? collegeAdminLinks
      : studentLinks;

  const roleTitle =
    user.role === 'super_admin'
      ? 'Super Admin Portal'
      : user.role === 'college_admin'
      ? 'College Admin Portal'
      : 'Student Portal';

  return (
    <aside className="sidebar-container">
      <div className="sidebar-header">
        <span className="sidebar-badge">{roleTitle}</span>
        {user.college && (
          <p className="sidebar-college-name">{user.college.name}</p>
        )}
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
            >
              <Icon size={18} className="sidebar-link-icon" />
              <span className="sidebar-link-text">{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="user-avatar-small">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-name">{user.name}</p>
            <p className="sidebar-user-role">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

