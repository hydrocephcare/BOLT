import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMedfly } from '../context/MedflyContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { 
  ArrowLeft,
  Clock,
  Eye,
  Download,
  Bookmark,
  Share2,
  User,
  Calendar,
  Award,
  ChevronRight,
  FileText,
  Star,
  Tag
} from 'lucide-react';

const NotePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { state, incrementNoteView } = useMedfly();
  const { notes, units, years, lecturers, loading } = state;
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const note = notes.find(n => n.slug === slug);
  const unit = units.find(u => u.id === note?.unit_id);
  const year = years.find(y => y.id === note?.year_id);
  const lecturer = lecturers.find(l => l.id === note?.lecturer_id);
  
  // Related notes from same unit
  const relatedNotes = notes
    .filter(n => n.unit_id === note?.unit_id && n.id !== note?.id && n.is_published)
    .slice(0, 3);

  useEffect(() => {
    if (note) {
      incrementNoteView(note.id);
    }
  }, [note, incrementNoteView]);

  const getYearColor = (yearNum: number) => {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    return colors[yearNum - 1] || 'blue';
  };

  const yearColor = getYearColor(year?.year_number || 1);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note?.title,
          text: note?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading note...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Note Not Found</h1>
          <p className="text-gray-600 mb-8">The note you're looking for doesn't exist or has been removed.</p>
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
      
      {/* Breadcrumb */}
      <section className="bg-white py-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-800 transition-colors">Home</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link to={`/year/${year?.year_number}`} className="text-blue-600 hover:text-blue-800 transition-colors">
              Year {year?.year_number}
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link to={`/unit/${unit?.id}`} className="text-blue-600 hover:text-blue-800 transition-colors">
              {unit?.unit_name}
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-600 truncate">{note.title}</span>
          </nav>
        </div>
      </section>

      {/* Note Content */}
      <article className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            to={`/unit/${unit?.id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors group"
          >
            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to {unit?.unit_name}
          </Link>

          {/* Note Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`badge badge-${note.difficulty_level?.toLowerCase() || 'intermediate'}`}>
                {note.difficulty_level || 'Intermediate'}
              </span>
              {note.is_featured && (
                <span className="badge badge-warning">
                  <Star size={12} className="mr-1" />
                  Featured
                </span>
              )}
              <span className={`badge bg-${yearColor}-100 text-${yearColor}-800`}>
                <Tag size={12} className="mr-1" />
                {unit?.unit_code}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-display text-gray-900 mb-4 leading-tight">
              {note.title}
            </h1>

            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {note.excerpt}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              {lecturer && (
                <div className="flex items-center space-x-2">
                  <User size={16} />
                  <span>{lecturer.title} {lecturer.name}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Calendar size={16} />
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={16} />
                <span>{note.estimated_read_time} min read</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye size={16} />
                <span>{note.view_count} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pb-8 border-b border-gray-200">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isBookmarked 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bookmark size={16} className={isBookmarked ? 'fill-current' : ''} />
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                <Download size={16} />
                <span>Download PDF</span>
              </button>
            </div>
          </motion.div>

          {/* Note Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          {/* Related Notes */}
          {relatedNotes.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="border-t border-gray-200 pt-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Notes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedNotes.map((relatedNote, index) => (
                  <motion.div
                    key={relatedNote.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden card-hover-subtle"
                  >
                    <div className={`h-32 bg-gradient-to-br from-${yearColor}-500 to-${yearColor}-600 relative`}>
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-sm font-medium">{unit?.unit_code}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link to={`/note/${relatedNote.slug}`} className="hover:text-blue-600 transition-colors">
                          {relatedNote.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {relatedNote.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{relatedNote.estimated_read_time} min</span>
                        <span>{relatedNote.view_count} views</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </article>

      <Footer />
    </div>
  );
};

export default NotePage;