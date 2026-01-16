import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Play, Clock, CheckCircle, 
  Lock, Loader2, ChevronDown, Video
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { coursesAPI } from '../lib/api';
import { toast } from 'sonner';

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await coursesAPI.getOne(courseId);
        setCourse(response.data);
        
        // Set first lesson as active
        if (response.data.lessons?.length > 0) {
          setActiveLesson(response.data.lessons[0]);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        if (error.response?.status === 403) {
          toast.error('Nemate pristup ovom kursu');
        } else {
          toast.error('Greška pri učitavanju kursa');
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h1 className="heading-3 mb-4">Kurs nije pronađen</h1>
        <Button asChild>
          <Link to="/dashboard">Nazad na Dashboard</Link>
        </Button>
      </div>
    );
  }

  // Get all lessons in order
  const allLessons = course.lessons || [];
  const currentIndex = allLessons.findIndex(l => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Parse video URL for embed
  const getVideoEmbed = (lesson) => {
    if (!lesson) return null;
    
    const videoUrl = lesson.video_url;
    const muxId = lesson.mux_playback_id;
    
    // MUX video
    if (muxId) {
      return (
        <iframe
          src={`https://stream.mux.com/${muxId}.m3u8`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
        />
      );
    }
    
    // YouTube
    if (videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be')) {
      let videoId = '';
      if (videoUrl.includes('youtube.com/watch')) {
        videoId = new URL(videoUrl).searchParams.get('v');
      } else if (videoUrl.includes('youtu.be')) {
        videoId = videoUrl.split('/').pop();
      }
      if (videoId) {
        return (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        );
      }
    }
    
    // Vimeo
    if (videoUrl?.includes('vimeo.com')) {
      const vimeoId = videoUrl.split('/').pop();
      return (
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}`}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
        />
      );
    }
    
    // Direct video URL
    if (videoUrl) {
      return (
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full"
        />
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen pt-20" data-testid="course-view-page">
      <div className="flex flex-col lg:flex-row">
        {/* Video Player Area */}
        <div className="flex-1 bg-black">
          <div className="aspect-video w-full relative">
            {getVideoEmbed(activeLesson) || (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Video sadržaj dolazi uskoro</p>
                  <p className="text-sm text-muted-foreground mt-2">Dodajte video URL u admin panelu</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Video Info */}
          <div className="p-6 lg:p-8 bg-background">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
                <ChevronRight className="w-4 h-4" />
                <span>{course.title}</span>
              </div>
              
              <h1 className="heading-3 mb-4">{activeLesson?.title || 'Odaberite lekciju'}</h1>
              {activeLesson?.description && (
                <p className="text-muted-foreground mb-6">{activeLesson.description}</p>
              )}
              
              {activeLesson?.duration_minutes && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                  <Clock className="w-4 h-4" />
                  <span>{activeLesson.duration_minutes} minuta</span>
                </div>
              )}
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!prevLesson}
                  onClick={() => setActiveLesson(prevLesson)}
                  data-testid="prev-lesson-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prethodna
                </Button>
                <span className="text-sm text-muted-foreground">
                  Lekcija {currentIndex + 1} od {allLessons.length}
                </span>
                <Button
                  className="bg-primary text-primary-foreground gap-2"
                  disabled={!nextLesson}
                  onClick={() => setActiveLesson(nextLesson)}
                  data-testid="next-lesson-btn"
                >
                  Sljedeća
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="w-full lg:w-96 bg-card border-l border-white/5 overflow-y-auto max-h-screen">
          <div className="p-6 border-b border-white/5">
            <h2 className="font-heading text-xl font-semibold mb-1">{course.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{allLessons.length} lekcija</span>
              {course.duration_hours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {course.duration_hours}h ukupno
                </span>
              )}
            </div>
          </div>
          
          <div className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-4 px-2">LEKCIJE</h3>
            <div className="space-y-2">
              {allLessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => setActiveLesson(lesson)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    activeLesson?.id === lesson.id 
                      ? 'bg-primary/10 border border-primary/30' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  data-testid={`lesson-item-${lesson.id}`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold ${
                    activeLesson?.id === lesson.id 
                      ? 'bg-primary text-black' 
                      : 'bg-white/10 text-foreground'
                  }`}>
                    {lesson.order || index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {lesson.duration_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {lesson.duration_minutes} min
                        </span>
                      )}
                      {lesson.video_url && (
                        <span className="text-xs text-green-500 flex items-center gap-1">
                          <Video className="w-3 h-3" />
                        </span>
                      )}
                      {lesson.is_free && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                          Besplatno
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {allLessons.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nema lekcija u ovom kursu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
