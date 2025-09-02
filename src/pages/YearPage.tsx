import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedfly } from '../context/MedflyContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star,
  ChevronRight,
  Microscope,
  GraduationCap,
  Award,
  Eye,
  Download
} from 'lucide-react';

const YearPage: React.FC = () => {
  const { yearNumber } = useParams<{ yearNumber: string }>();
  const { state } = useMedfly();
  const { years, units, notes, lecturers, loading } = state;
  
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  
  const currentYear = years.find(year => year.year_number === parseInt(yearNumber || '1'));
  const yearUnits = units.filter(unit => unit.year_id === currentYear?.id);
  const yearNotes = notes.filter(note => 
    note.year_id === currentYear?.id && 
    note.is_published &&
    (selectedUnit === 'all' || note.unit_id === selectedUnit)
  );

  const getYearColor = (yearNum: number) => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    return colors[yearNum - 1] || 'blue';
  };

  const yearColor = getYearColor(parseInt(yearNumber || '1'));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading medical notes...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!currentYear) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Year Not Found</h1>
          <p className="text-gray-600 mb-8">The academic year you're looking for doesn't exist.</p>
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
      
      {/* Year Hero Section */}
      <section className={`relative bg-gradient-to-br from-${yearColor}-600 via-${yearColor}-700 to-${yearColor}-800 text-white py-16 overflow-hidden`}>
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center mb-6">
              <div className={`w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl`}>
                <GraduationCap className={`w-10 h-10 text-${yearColor}-600`} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
              Year {currentYear.year_number}
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mb-6 text-${yearColor}-100">
              {currentYear.year_name}
            </h2>
            <p className="text-xl text-${yearColor}-100 max-w-3xl mx-auto mb-8">
              {currentYear.description}
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-${yearColor}-100">
              <div className="flex items-center space-x-2">
                <Microscope className="w-5 h-5" />
                <span>{yearUnits.length} Units</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>{yearNotes.length} Notes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>{new Set(yearUnits.map(u => u.lecturer_id)).size} Lecturers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Units Filter */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            <button
              onClick={() => setSelectedUnit('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedUnit === 'all'
                  ? `bg-${yearColor}-100 text-${yearColor}-700`
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Units ({yearNotes.length})
            </button>
            {yearUnits.map((unit) => {
              const unitNotes = notes.filter(note => note.unit_id === unit.id && note.is_published);
              return (
                <button
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    selectedUnit === unit.id
                      ? `bg-${yearColor}-100 text-${yearColor}-700`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {unit.unit_name} ({unitNotes.length})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Units Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {yearUnits.map((unit, index) => {
              const unitNotes = notes.filter(note => note.unit_id === unit.id && note.is_published);
              const lecturer = lecturers.find(l => l.id === unit.lecturer_id);
              
              return (
                <motion.div
                  key={unit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover"
                >
                  <div className={`bg-gradient-to-br from-${yearColor}-500 to-${yearColor}-600 p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">{unit.unit_code}</h3>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                        Semester {unit.semester}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{unit.unit_name}</h4>
                    <p className="text-sm opacity-90">{unit.description}</p>
                  </div>
                  
                  <div className="p-6">
                    {lecturer && (
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users size={16} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{lecturer.title} {lecturer.name}</p>
                          <p className="text-sm text-gray-600">{lecturer.specialization}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <BookOpen size={14} className="mr-1" />
                        {unitNotes.length} Notes
                      </span>
                      <span className="flex items-center">
                        <Award size={14} className="mr-1" />
                        {unit.credit_hours} Credits
                      </span>
                    </div>
                    
                    <Link
                      to={`/unit/${unit.id}`}
                      className={`inline-flex items-center justify-between w-full px-4 py-3 bg-${yearColor}-50 text-${yearColor}-700 rounded-lg hover:bg-${yearColor}-100 transition-colors group`}
                    >
                      <span className="font-medium">View Notes</span>
                      <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default YearPage;