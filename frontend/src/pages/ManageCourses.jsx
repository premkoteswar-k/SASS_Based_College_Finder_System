import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  IndianRupee,
} from 'lucide-react';
import { courseApi, authApi, subscriptionApi } from '../utils/api';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import './ManageCourses.css';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [collegeId, setCollegeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form, setForm] = useState({
    name: '',
    degree: 'B.Tech',
    specialization: '',
    duration: '4 Years',
    intake: 60,
    feePerYear: 85000,
    eligibility: '10+2 with Mathematics, Physics, and Chemistry (TS EAMCET qualified)',
    examAccepted: 'TS EAMCET',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const loadCourses = async () => {
    try {
      setLoading(true);
      const meRes = await authApi.getMe();
      const cid = meRes.user?.collegeId;
      if (!cid) throw new Error('No college assigned to this admin account');
      setCollegeId(cid);

      const [coursesRes, subRes] = await Promise.all([
        courseApi.getAll({ collegeId: cid }),
        subscriptionApi.getCurrent(),
      ]);

      setCourses(coursesRes.data || []);
      setSubscription(subRes.data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const openAddModal = () => {
    setEditingCourse(null);
    setForm({
      name: '',
      degree: 'B.Tech',
      specialization: '',
      duration: '4 Years',
      intake: 60,
      feePerYear: 85000,
      eligibility: '10+2 with Mathematics, Physics, and Chemistry (TS EAMCET qualified)',
      examAccepted: 'TS EAMCET',
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setForm({
      name: course.name || '',
      degree: course.degree || 'B.Tech',
      specialization: course.specialization || '',
      duration: course.duration || '4 Years',
      intake: course.intake || 60,
      feePerYear: course.feePerYear || 85000,
      eligibility: course.eligibility || '',
      examAccepted: course.examAccepted || 'TS EAMCET',
    });
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course from your college profile?')) {
      return;
    }
    try {
      await courseApi.delete(id);
      setCourses(courses.filter((c) => c._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete course');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage('');

      if (editingCourse) {
        const res = await courseApi.update(editingCourse._id, form);
        setCourses(courses.map((c) => (c._id === editingCourse._id ? res.data : c)));
      } else {
        const res = await courseApi.create({ ...form, college: collegeId });
        setCourses([...courses, res.data]);
      }

      setModalOpen(false);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const maxAllowed = subscription?.plan?.maxCourses || 5;
  const isLimitReached = courses.length >= maxAllowed;

  return (
    <div className="dashboard-layout-container">
      <Sidebar />

      <main className="dashboard-content-main">
        {/* Header Bar */}
        <div className="courses-manager-header">
          <div>
            <h1 className="courses-title">Manage B.Tech Branches & Fees</h1>
            <p className="courses-subtitle">
              Add engineering specializations, update sanctioned seat intakes, and publish official annual tuition.
            </p>
          </div>

          <button
            className="btn-add-course"
            onClick={openAddModal}
            disabled={isLimitReached}
          >
            <Plus size={18} />
            <span>Add New Course</span>
          </button>
        </div>

        {/* Plan Limit Banner */}
        <div className={`plan-quota-strip ${isLimitReached ? 'quota-full' : ''}`}>
          <div className="quota-text">
            <span>SaaS Plan Quota:</span>
            <strong>
              {courses.length} of {maxAllowed} Courses Used
            </strong>
          </div>
          {isLimitReached && (
            <span className="quota-warning-badge">
              Course limit reached. Upgrade subscription to add more branches.
            </span>
          )}
        </div>

        {/* Courses Table Card */}
        <div className="courses-card-table-wrap">
          {loading ? (
            <div className="courses-loading-state">
              <div className="spinner-circle"></div>
              <p>Loading course catalogue...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="courses-empty-state">
              <BookOpen size={48} className="empty-book-icon" />
              <h3>No Courses Listed Yet</h3>
              <p>Click the "Add New Course" button above to publish your first engineering degree.</p>
            </div>
          ) : (
            <table className="courses-admin-table">
              <thead>
                <tr>
                  <th>Degree & Branch</th>
                  <th>Specialization</th>
                  <th>Intake Seats</th>
                  <th>Annual Tuition</th>
                  <th>Accepted Exam</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <div className="course-degree-wrap">
                        <span className="degree-tag">{course.degree}</span>
                        <span className="course-title-text">{course.name}</span>
                      </div>
                    </td>
                    <td>{course.specialization || 'Core'}</td>
                    <td><strong>{course.intake}</strong> Seats</td>
                    <td className="fee-td">₹{course.feePerYear?.toLocaleString('en-IN')}</td>
                    <td>{course.examAccepted || 'TS EAMCET'}</td>
                    <td>
                      <div className="course-action-buttons">
                        <button
                          className="btn-action-edit"
                          onClick={() => openEditModal(course)}
                          title="Edit course"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="btn-action-delete"
                          onClick={() => handleDeleteCourse(course._id)}
                          title="Delete course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add / Edit Course Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCourse ? 'Edit Course Details' : 'Add New Engineering Course'}
          size="md"
        >
          {errorMessage && (
            <div className="modal-error-alert">{errorMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="modal-course-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Degree Level *</label>
                <select
                  value={form.degree}
                  onChange={(e) => setForm({ ...form, degree: e.target.value })}
                  className="form-select"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="MBA">MBA</option>
                  <option value="MCA">MCA</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  className="form-input"
                  placeholder="4 Years"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Branch / Course Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="form-input"
                placeholder="e.g. Computer Science and Engineering"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization (Optional)</label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                className="form-input"
                placeholder="e.g. Artificial Intelligence & Machine Learning"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Sanctioned Intake (Seats) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={form.intake}
                  onChange={(e) => setForm({ ...form, intake: Number(e.target.value) })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Tuition Fee (in ₹) *</label>
                <input
                  type="number"
                  required
                  value={form.feePerYear}
                  onChange={(e) => setForm({ ...form, feePerYear: Number(e.target.value) })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Accepted Entrance Exam</label>
              <input
                type="text"
                value={form.examAccepted}
                onChange={(e) => setForm({ ...form, examAccepted: e.target.value })}
                className="form-input"
                placeholder="TS EAMCET / JEE Main"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Eligibility Criteria</label>
              <textarea
                rows={2}
                value={form.eligibility}
                onChange={(e) => setForm({ ...form, eligibility: e.target.value })}
                className="form-textarea"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-submit-course-modal"
            >
              {submitting
                ? 'Saving Course...'
                : editingCourse
                ? 'Update Course'
                : 'Publish Course'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ManageCourses;

