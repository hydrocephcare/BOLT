import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedfly } from '../context/MedflyContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  BookOpen, 
  User, 
  Clock, 
  Star,
  Download,
  Eye,
  ChevronRight,
  ArrowLeft,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Award,
  Bookmark
} from 'lucide-react';

const UnitPage: React.FC = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const { state } = useMedfly();
  const { units, notes, lecturers, years, loading } = state;
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  
  const unit = units.find(u => u.id === unitId);
  const lecturer = lecturers.find(l => l.id === unit?.lecturer_id);
  const year = years.find(y => y.id === unit?.year_id);
  
  let unitNotes = notes.filter(note => 
    note.unit_id === unitId && 
    note.is_published &&
    (difficultyFilter === 'all' || note.difficulty_level === difficultyFilter)
  );

  // Sort notes
  unitNotes = unitNotes.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'popular':
        return b.view_count - a.view_count;
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  const getYearColor = (yearNum: number) => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    return colors[yearNum - 1] || 'blue';
  };

  const yearColor = getYearColor(year?.year_number || 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading unit notes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Unit Not Found</h1>
          <p className="text-gray-600 mb-8">The unit you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Unit Hero Section */}
      <section className={`relative bg-gradient-to-br from-${yearColor}-600 via-${yearColor}-700 to-${yearColor}-800 text-white py-16`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm mb-8">
              <Link to="/" className="hover:underline">Home</Link>
              <ChevronRight size={16} />
              <Link to={`/year/${year?.year_number}`} className="hover:underline">
                Year {year?.year_number}
              </Link>
              <ChevronRight size={16} />
              <span>{unit.unit_name}</span>
            </nav>

            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
                {unit.unit_name}
              </h1>
              <p className="text-xl mb-2">{unit.unit_code}</p>
              <p className="text-lg text-${yearColor}-100 max-w-3xl mx-auto mb-8">
                {unit.description}
              </p>
              
              {lecturer && (
                <div className="flex items-center justify-center space-x-4 mb-8">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>{lecturer.title} {lecturer.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>{lecturer.specialization}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-center space-x-8 text-${yearColor}-100">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{unitNotes.length} Notes Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Semester {unit.semester}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>{unit.credit_hours} Credit Hours</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters and Controls */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="title">Alphabetical</option>
              </select>
              
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="bg-gray-100 rounded-lg p-1 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <Grid3X3 size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notes Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {unitNotes.length > 0 ? (
            <motion.div
              className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1 max-w-4xl mx-auto'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {unitNotes.map((note, index) => (
                <motion.article
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden card-hover ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''} relative h-48 bg-gradient-to-br from-${yearColor}-500 to-${yearColor}-600`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4">
                      <span className={`badge badge-${note.difficulty_level?.toLowerCase() || 'intermediate'}`}>
                        {note.difficulty_level || 'Intermediate'}
                      </span>
                    </div>
                    {note.is_featured && (
                      <div className="absolute top-4 right-4">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-sm font-medium">{unit.unit_code}</p>
                      <p className="text-xs opacity-75">Year {year?.year_number}</p>
                    </div>
                  </div>
                  
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link to={`/note/${note.slug}`} className="hover:text-blue-600 transition-colors">
                        {note.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {note.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        {note.estimated_read_time} min read
                      </span>
                      <span className="flex items-center">
                        <Eye size={14} className="mr-1" />
                        {note.view_count} views
                      </span>
                      <span className="flex items-center">
                        <Download size={14} className="mr-1" />
                        {note.download_count}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <button className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors">
                        <Bookmark size={16} />
                        <span className="text-sm">Bookmark</span>
                      </button>
                      <Link
                        to={`/note/${note.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm group"
                      >
                        Read Note
                        <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                <BookOpen size={80} className="mx-auto text-gray-300 mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Notes Available</h3>
                <p className="text-gray-600 mb-8">
                  No notes have been uploaded for this unit yet. Check back later or contact your lecturer.
                </p>
                <Link
                  to={`/year/${year?.year_number}`}
                  className="btn btn-primary"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Back to Year {year?.year_number}
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default UnitPage;