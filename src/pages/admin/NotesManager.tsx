import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedfly } from '../../context/MedflyContext';
import RichTextEditor from '../../components/RichTextEditor';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Save,
  X,
  Calendar,
  Clock,
  FileText,
  Star,
  User,
  BookOpen,
  Award,
  Filter
} from 'lucide-react';

interface FormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  unit_id: string;
  year_id: string;
  lecturer_id: string;
  difficulty_level: string;
  estimated_read_time: number;
  is_published: boolean;
  is_featured: boolean;
  featured_image: string;
}

const INITIAL_FORM_DATA: FormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  unit_id: '',
  year_id: '',
  lecturer_id: '',
  difficulty_level: 'Intermediate',
  estimated_read_time: 5,
  is_published: false,
  is_featured: false,
  featured_image: '',
};

const NotesManager: React.FC = () => {
  const { state, createNote, updateNote, deleteNote } = useMedfly();
  const { notes, units, years, lecturers, loading } = state;

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

  // Memoized filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           note.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'published' && note.is_published) ||
                           (statusFilter === 'draft' && !note.is_published);
      const matchesYear = yearFilter === 'all' || note.year_id === yearFilter;
      return matchesSearch && matchesStatus && matchesYear;
    });
  }, [notes, searchTerm, statusFilter, yearFilter]);

  // Utility functions
  const generateSlug = useCallback((title: string): string => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  const calculateReadTime = useCallback((content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }, []);

  // Form handlers
  const handleTitleChange = useCallback((title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  }, [generateSlug]);

  const handleContentChange = useCallback((content: string) => {
    setFormData(prev => ({
      ...prev,
      content,
      estimated_read_time: calculateReadTime(content)
    }));
  }, [calculateReadTime]);

  const handleFormDataChange = useCallback(<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!formData.title.trim()) {
      toast.error('Note title is required');
      return false;
    }
    if (!formData.content.trim()) {
      toast.error('Note content is required');
      return false;
    }
    if (!formData.excerpt.trim()) {
      toast.error('Note excerpt is required');
      return false;
    }
    if (!formData.unit_id) {
      toast.error('Please select a unit');
      return false;
    }
    if (!formData.year_id) {
      toast.error('Please select a year');
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const noteData = {
        ...formData,
        title: formData.title.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
        slug: formData.slug || generateSlug(formData.title),
      };

      if (editingNote) {
        await updateNote(editingNote.id, noteData);
        toast.success('Note updated successfully');
      } else {
        await createNote(noteData);
        toast.success('Note created successfully');
      }
      resetForm();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      toast.error(`Failed to save note: ${errorMessage}`);
      console.error('Error saving note:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setEditingNote(null);
    setShowForm(false);
  }, []);

  const handleEdit = useCallback((note: any) => {
    setEditingNote(note);
    setFormData({
      title: note.title,
      slug: note.slug,
      content: note.content,
      excerpt: note.excerpt,
      unit_id: note.unit_id,
      year_id: note.year_id,
      lecturer_id: note.lecturer_id || '',
      difficulty_level: note.difficulty_level || 'Intermediate',
      estimated_read_time: note.estimated_read_time || 5,
      is_published: note.is_published,
      is_featured: note.is_featured,
      featured_image: note.featured_image || '',
    });
    setShowForm(true);
  }, []);

  const handleDelete = async (note: any) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${note.title}"? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await deleteNote(note.id);
      toast.success('Note deleted successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete note';
      toast.error(errorMessage);
      console.error('Error deleting note:', error);
    }
  };

  const togglePublishStatus = async (note: any) => {
    try {
      await updateNote(note.id, { is_published: !note.is_published });
      const action = !note.is_published ? 'published' : 'unpublished';
      toast.success(`Note ${action} successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update note status';
      toast.error(errorMessage);
      console.error('Error updating note status:', error);
    }
  };

  // Statistics
  const statistics = useMemo(() => {
    const published = notes.filter(n => n.is_published).length;
    const drafts = notes.filter(n => !n.is_published).length;
    const featured = notes.filter(n => n.is_featured).length;
    return { total: notes.length, published, drafts, featured };
  }, [notes]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Medical Notes Management</h1>
              <p className="text-gray-600 mt-1">
                Create and manage comprehensive medical study materials
              </p>
              <div className="flex items-center space-x-6 mt-3 text-sm text-gray-500">
                <span>Total: <strong className="text-gray-900">{statistics.total}</strong></span>
                <span>Published: <strong className="text-green-600">{statistics.published}</strong></span>
                <span>Drafts: <strong className="text-yellow-600">{statistics.drafts}</strong></span>
                <span>Featured: <strong className="text-blue-600">{statistics.featured}</strong></span>
              </div>
            </div>
            <motion.button
              onClick={() => setShowForm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Medical Note
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Filters */}
              <motion.div 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search notes by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Drafts</option>
                    </select>
                  </div>
                  <div>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Years</option>
                      {years.map((year) => (
                        <option key={year.id} value={year.id}>
                          Year {year.year_number}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Notes Grid */}
              {filteredNotes.length > 0 ? (
                <motion.div 
                  className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {filteredNotes.map((note, index) => {
                    const noteUnit = units.find(u => u.id === note.unit_id);
                    const noteYear = years.find(y => y.id === note.year_id);
                    const noteLecturer = lecturers.find(l => l.id === note.lecturer_id);

                    return (
                      <motion.article
                        key={note.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        {/* Note Header */}
                        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600">
                          <div className="absolute inset-0 bg-black/20"></div>
                          <div className="absolute top-3 left-3 flex items-center space-x-2">
                            <span className={`badge badge-${note.difficulty_level?.toLowerCase() || 'intermediate'}`}>
                              {note.difficulty_level || 'Intermediate'}
                            </span>
                            {note.is_featured && (
                              <span className="badge badge-warning">
                                <Star size={12} className="mr-1" />
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className={`badge ${
                              note.is_published 
                                ? 'badge-success' 
                                : 'badge-warning'
                            }`}>
                              {note.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <div className="absolute bottom-3 left-3 text-white">
                            <p className="text-sm font-medium">{noteUnit?.unit_code}</p>
                            <p className="text-xs opacity-75">Year {noteYear?.year_number}</p>
                          </div>
                        </div>

                        {/* Note Content */}
                        <div className="p-6">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                            {note.title}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {note.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Clock size={12} className="mr-1" />
                                {note.estimated_read_time} min
                              </span>
                              <span className="flex items-center">
                                <Eye size={12} className="mr-1" />
                                {note.view_count}
                              </span>
                            </div>
                            <span className="flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {new Date(note.created_at).toLocaleDateString()}
                            </span>
                          </div>

                          {noteLecturer && (
                            <div className="flex items-center space-x-2 mb-4">
                              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <User size={12} className="text-gray-600" />
                              </div>
                              <span className="text-sm text-gray-600">{noteLecturer.name}</span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center space-x-1">
                              <motion.button
                                onClick={() => togglePublishStatus(note)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`p-2 rounded-lg transition-colors ${
                                  note.is_published 
                                    ? 'text-yellow-600 hover:bg-yellow-50' 
                                    : 'text-green-600 hover:bg-green-50'
                                }`}
                                title={note.is_published ? 'Unpublish note' : 'Publish note'}
                              >
                                {note.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </motion.button>
                              <motion.button
                                onClick={() => handleEdit(note)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit note"
                              >
                                <Edit3 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                onClick={() => handleDelete(note)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete note"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                            <span className="text-xs text-gray-400">
                              {note.content.split(/\s+/).length} words
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </motion.div>
              ) : (
                <motion.div 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No notes found' : 'No medical notes yet'}
                  </h3>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {searchTerm 
                      ? `No notes match your search for "${searchTerm}". Try adjusting your filters.`
                      : 'Start creating comprehensive medical notes for students. Your first note is just a click away.'
                    }
                  </p>
                  {!searchTerm && (
                    <motion.button
                      onClick={() => setShowForm(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Your First Note
                    </motion.button>
                  )}
                </motion.div>
              )}
            </motion.div>
          ) : (
            /* Note Form */
            <motion.div
              key="form"
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
            >
              {/* Form Header */}
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingNote ? 'Edit Medical Note' : 'Create New Medical Note'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {editingNote ? 'Update your medical note content' : 'Share knowledge with medical students across Africa'}
                    </p>
                  </div>
                  <motion.button
                    onClick={resetForm}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className="w-full px-4 py-3 text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Introduction to Human Anatomy - Skeletal System"
                        required
                        maxLength={150}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/150 characters
                      </p>
                    </div>

                    {/* Slug */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleFormDataChange('slug', e.target.value)}
                        className="w-full px-4 py-2 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="introduction-human-anatomy-skeletal-system"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note Summary *
                      </label>
                      <textarea
                        value={formData.excerpt}
                        onChange={(e) => handleFormDataChange('excerpt', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Provide a clear summary of what students will learn from this note..."
                        required
                        maxLength={300}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.excerpt.length}/300 characters
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note Content *
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <RichTextEditor
                          value={formData.content}
                          onChange={handleContentChange}
                          placeholder="Write comprehensive medical content here. Use headings, lists, and formatting to make it easy to study..."
                          height="500px"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Word count: {formData.content.split(/\s+/).filter(word => word.length > 0).length} words
                        • Estimated read time: {formData.estimated_read_time} min
                      </p>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Academic Information */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Year *
                          </label>
                          <select
                            value={formData.year_id}
                            onChange={(e) => {
                              handleFormDataChange('year_id', e.target.value);
                              handleFormDataChange('unit_id', ''); // Reset unit when year changes
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Select Year</option>
                            {years.map((year) => (
                              <option key={year.id} value={year.id}>
                                Year {year.year_number} - {year.year_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Medical Unit *
                          </label>
                          <select
                            value={formData.unit_id}
                            onChange={(e) => handleFormDataChange('unit_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={!formData.year_id}
                          >
                            <option value="">Select Unit</option>
                            {units
                              .filter(unit => unit.year_id === formData.year_id)
                              .map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.unit_code} - {unit.unit_name}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lecturer
                          </label>
                          <select
                            value={formData.lecturer_id}
                            onChange={(e) => handleFormDataChange('lecturer_id', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select Lecturer</option>
                            {lecturers.map((lecturer) => (
                              <option key={lecturer.id} value={lecturer.id}>
                                {lecturer.title} {lecturer.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty Level
                          </label>
                          <select
                            value={formData.difficulty_level}
                            onChange={(e) => handleFormDataChange('difficulty_level', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Publishing Options */}
                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
                      
                      <div className="space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_published}
                            onChange={(e) => handleFormDataChange('is_published', e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Publish immediately
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Make this note visible to all students
                            </p>
                          </div>
                        </label>

                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.is_featured}
                            onChange={(e) => handleFormDataChange('is_featured', e.target.checked)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Feature this note
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              Show in featured section on homepage
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="space-y-3">
                      <motion.button
                        type="submit"
                        disabled={submitting}
                        whileHover={{ scale: submitting ? 1 : 1.02 }}
                        whileTap={{ scale: submitting ? 1 : 0.98 }}
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            {editingNote ? 'Updating Note...' : 'Creating Note...'}
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            {editingNote ? 'Update Note' : 'Create Note'}
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={resetForm}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                        disabled={submitting}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchPage;