import React, { useState, useEffect } from 'react';
import { Users, Search, Trash2, ShieldCheck, Building2, UserCheck, UserX } from 'lucide-react';
import { userApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Badge from '../components/Badge';
import './ManageUsers.css';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search) params.search = search;

      const res = await userApi.getAll(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleToggleActive = async (id, currentVal) => {
    try {
      await userApi.updateStatus(id, { isActive: !currentVal });
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: !currentVal } : u))
      );
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (id, email) => {
    if (!window.confirm(`Delete user account "${email}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await userApi.delete(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete user');
    }
  };

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header */}
        <div className="users-manager-header">
          <div>
            <h1 className="users-title">Platform User Management</h1>
            <p className="users-subtitle">
              Manage accounts, roles, access permissions, and account activation states across all 3 roles.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="users-controls-bar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search user by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="users-search-input"
            />
          </div>

          <div className="role-filter-pills">
            {['all', 'super_admin', 'college_admin', 'student'].map((r) => (
              <button
                key={r}
                className={`role-pill-btn ${roleFilter === r ? 'role-pill-active' : ''}`}
                onClick={() => setRoleFilter(r)}
              >
                {r === 'all'
                  ? 'All Roles'
                  : r === 'super_admin'
                  ? 'Super Admins'
                  : r === 'college_admin'
                  ? 'College Admins'
                  : 'Students'}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table Card */}
        <div className="users-card-wrap">
          {loading ? (
            <div className="users-loading-view">
              <div className="spinner-circle"></div>
              <p>Fetching user accounts...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="users-empty-view">
              <Users size={44} className="empty-icon" />
              <h3>No users found</h3>
              <p>Try modifying your search or role filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="users-admin-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email Address</th>
                    <th>Contact Phone</th>
                    <th>Role</th>
                    <th>Linked College</th>
                    <th>Account Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-tag">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="user-name-bold">{u.name}</span>
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone || 'N/A'}</td>
                      <td>
                        {u.role === 'super_admin' && (
                          <Badge type="purple" size="sm" label="Super Admin" />
                        )}
                        {u.role === 'college_admin' && (
                          <Badge type="info" size="sm" label="College Admin" />
                        )}
                        {u.role === 'student' && (
                          <Badge type="success" size="sm" label="Student" />
                        )}
                      </td>
                      <td>
                        {u.collegeId ? (
                          <span className="linked-college-tag">
                            {u.collegeId.code || u.collegeId.name}
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <button
                          className={`btn-status-toggle ${u.isActive ? 'btn-active' : 'btn-deactive'}`}
                          onClick={() => handleToggleActive(u._id, u.isActive)}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>
                      <td>
                        <button
                          className="btn-delete-user"
                          onClick={() => handleDeleteUser(u._id, u.email)}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ManageUsers;

