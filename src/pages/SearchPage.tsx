import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMedfly } from '../context/MedflyContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Calendar,
  TrendingUp,
  BookOpen,
  Clock,
  X,
  ChevronDown,
  Star,
  Eye,
  Download,
  User,
  GraduationCap,
  Microscope,
  Award
} from 'lucide-react';

const SearchPage: React.FC = () => {
  const { state, searchNotes } = useMedfly();
  const { notes, units, years, lecturers, searchResults, isSearching, loading } = state;
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State management
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedYear, setSelectedYear] = useState(searchParams.get('year') || 'all');
  const [selectedUnit, setSelectedUnit] = useState(searchParams.get('unit') || 'all');
  const [selectedLecturer, setSelectedLecturer] = useState(searchParams.get('lecturer') || 'all');
  const [difficultyLevel, setDifficultyLevel] = useState(searchParams.get('difficulty') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Perform search when parameters change
  useEffect(() => {
    const filters = {
      yearId: selectedYear !== 'all' ? selectedYear : undefined,
      unitId: selectedUnit !== 'all' ? selectedUnit : undefined,
      lecturerId: selectedLecturer !== 'all' ? selectedLecturer : undefined,
      difficultyLevel: difficultyLevel !== 'all' ? difficultyLevel : undefined,
    };

    searchNotes(searchTerm, filters);
  }, [searchTerm, selectedYear, selectedUnit, selectedLecturer, difficultyLevel, searchNotes]);

  // Update URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (selectedYear !== 'all') params.set('year', selectedYear);
    if (selectedUnit !== 'all') params.set('unit', selectedUnit);
    if (selectedLecturer !== 'all') params.set('lecturer', selectedLecturer);
    if (difficultyLevel !== 'all') params.set('difficulty', difficultyLevel);
    
    setSearchParams(params);
  }, [searchTerm, selectedYear, selectedUnit, selectedLecturer, difficultyLevel, setSearchParams]);

  // Filter units based on selected year
  const filteredUnits = useMemo(() => {
    if (selectedYear === 'all') return units;
    return units.filter(unit => unit.year_id === selectedYear);
  }, [units, selectedYear]);

  // Sort results
  const sortedResults = useMemo(() => {
    const results = [...searchResults];
    return results.sort((a, b) => {
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
  }, [searchResults, sortBy]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedYear !== 'all') count++;
    if (selectedUnit !== 'all') count++;
    if (selectedLecturer !== 'all') count++;
    if (difficultyLevel !== 'all') count++;
    return count;
  }, [selectedYear, selectedUnit, selectedLecturer, difficultyLevel]);

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedYear('all');
    setSelectedUnit('all');
    setSelectedLecturer('all');
    setDifficultyLevel('all');
    setSearchParams({});
  };

  const getYearColor = (yearNum: number) => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    return colors[yearNum - 1] || 'blue';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Search Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-6">
              Discover Medical Knowledge
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Search through comprehensive medical notes organized by years, units, and expert lecturers
            </p>
            
            <div className="max-w-2xl mx-auto">
              <SearchBar 
                placeholder="Search medical notes, units, topics..."
                onSearch={(term) => setSearchTerm(term)}
              />
            </div>
            
            <div className="flex items-center justify-center space-x-8 mt-8 text-blue-100">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>{notes.filter(n => n.is_published).length} Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Microscope className="w-5 h-5" />
                <span>{units.length} Units</span>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>{years.length} Years</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Quick Filters */}
            <div className="flex items-center space-x-4 overflow-x-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year.id} value={year.id}>
                    Year {year.year_number} - {year.year_name}
                  </option>
                ))}
              </select>

              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={selectedYear === 'all'}
              >
                <option value="all">All Units</option>
                {filteredUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.unit_name}
                  </option>
                ))}
              </select>

              <select
                value={difficultyLevel}
                onChange={(e) => setDifficultyLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Controls */}
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

              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X size={16} className="mr-1" />
                  Clear ({activeFiltersCount})
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              {isSearching ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Searching...
                </span>
              ) : (
                <>
                  <span className="font-semibold text-gray-900">{sortedResults.length}</span>
                  {' '}note{sortedResults.length !== 1 ? 's' : ''} found
                  {searchTerm && (
                    <span className="text-gray-500">
                      {' '}for "{searchTerm}"
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Search Results */}
          <AnimatePresence mode="wait">
            {sortedResults.length > 0 ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1 max-w-4xl mx-auto'
                }`}
              >
                {sortedResults.map((note, index) => {
                  const noteUnit = units.find(u => u.id === note.unit_id);
                  const noteYear = years.find(y => y.id === note.year_id);
                  const noteLecturer = lecturers.find(l => l.id === note.lecturer_id);
                  const yearColor = getYearColor(noteYear?.year_number || 1);

                  return (
                    <motion.article
                      key={note.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
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
                          <p className="text-sm font-medium">{noteUnit?.unit_code}</p>
                          <p className="text-xs opacity-75">Year {noteYear?.year_number}</p>
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
                            {note.estimated_read_time} min
                          </span>
                          <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {note.view_count}
                          </span>
                          <span className="flex items-center">
                            <Download size={14} className="mr-1" />
                            {note.download_count}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                              <User size={12} className="text-gray-600" />
                            </div>
                            <span className="text-sm text-gray-600">{noteLecturer?.name}</span>
                          </div>
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
                  );
                })}
              </motion.div>
            ) : !isSearching ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-20"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 max-w-md mx-auto">
                  <Search size={80} className="mx-auto text-gray-300 mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {searchTerm ? 'No Notes Found' : 'Start Your Search'}
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {searchTerm
                      ? `No medical notes found matching "${searchTerm}". Try adjusting your search terms or filters.`
                      : 'Use the search bar above to find medical notes by topic, unit, or lecturer.'}
                  </p>
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="btn btn-primary"
                    >
                      Clear All Filters
                    </button>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* Quick Access Section */}
      {!searchTerm && sortedResults.length === 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Browse by Academic Year</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {years.map((year, index) => {
                const yearColor = getYearColor(year.year_number);
                const yearUnits = units.filter(unit => unit.year_id === year.id);
                const yearNotes = notes.filter(note => note.year_id === year.id && note.is_published);
                
                return (
                  <motion.div
                    key={year.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover"
                  >
                    <div className={`year-${year.year_number}-bg h-32 relative`}>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold mb-1">Year {year.year_number}</h3>
                          <p className="text-sm opacity-90">{yearUnits.length} Units</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">
                        {year.year_name}
                      </h4>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {year.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span className="flex items-center">
                          <BookOpen size={14} className="mr-1" />
                          {yearNotes.length} Notes
                        </span>
                        <span className="flex items-center">
                          <Microscope size={14} className="mr-1" />
                          {yearUnits.length} Units
                        </span>
                      </div>
                      
                      <Link
                        to={`/year/${year.year_number}`}
                        className={`inline-flex items-center justify-between w-full px-4 py-3 bg-${yearColor}-50 text-${yearColor}-700 rounded-lg hover:bg-${yearColor}-100 transition-colors group`}
                      >
                        <span className="font-medium">Explore Year {year.year_number}</span>
                        <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;