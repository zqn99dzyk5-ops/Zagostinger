import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Play, Clock, CheckCircle, 
  Lock, Loader2, ChevronDown 
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { coursesAPI } from '../lib/api';
import { toast } from 'sonner';

const CourseView = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const response = await coursesAPI.getOne(courseId);
        setCourse(response.data);
        
        // Set first video as active
        if (response.data.modules?.length > 0 && response.data.modules[0].videos?.length > 0) {
          setActiveVideo(response.data.modules[0].videos[0]);
        }
      } catch (error) {
        console.error('Error loading course:', error);
        toast.error('Greška pri učitavanju kursa');
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

  // Get all videos in order
  const allVideos = course.modules?.flatMap(m => m.videos || []) || [];
  const currentIndex = allVideos.findIndex(v => v.id === activeVideo?.id);
  const prevVideo = currentIndex > 0 ? allVideos[currentIndex - 1] : null;
  const nextVideo = currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null;

  return (
    <div className="min-h-screen pt-20" data-testid="course-view-page">
      <div className="flex flex-col lg:flex-row">
        {/* Video Player Area */}
        <div className="flex-1 bg-black">
          <div className="aspect-video w-full relative">
            {activeVideo?.mux_playback_id ? (
              <iframe
                src={`https://stream.mux.com/${activeVideo.mux_playback_id}.m3u8`}
                className="w-full h-full"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-card">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground">Video sadržaj dolazi uskoro</p>
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
              
              <h1 className="heading-3 mb-4">{activeVideo?.title || 'Odaberite video'}</h1>
              <p className="text-muted-foreground mb-6">{activeVideo?.description}</p>
              
              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={!prevVideo}
                  onClick={() => setActiveVideo(prevVideo)}
                  data-testid="prev-video-btn"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prethodna
                </Button>
                <Button
                  className="bg-primary text-primary-foreground gap-2"
                  disabled={!nextVideo}
                  onClick={() => setActiveVideo(nextVideo)}
                  data-testid="next-video-btn"
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
            <p className="text-sm text-muted-foreground">
              {allVideos.length} lekcija
            </p>
          </div>
          
          <Accordion type="multiple" defaultValue={course.modules?.map(m => m.id)} className="w-full">
            {course.modules?.map((module, moduleIndex) => (
              <AccordionItem key={module.id} value={module.id} className="border-white/5">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-white/5">
                  <div className="flex items-start gap-3 text-left">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                      {moduleIndex + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{module.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {module.videos?.length || 0} lekcija
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pb-0">
                  <div className="space-y-1">
                    {module.videos?.map((video, videoIndex) => (
                      <button
                        key={video.id}
                        onClick={() => setActiveVideo(video)}
                        className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${
                          activeVideo?.id === video.id 
                            ? 'bg-primary/10 border-l-2 border-primary' 
                            : 'hover:bg-white/5'
                        }`}
                        data-testid={`video-item-${video.id}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          activeVideo?.id === video.id ? 'bg-primary text-black' : 'bg-white/10'
                        }`}>
                          <Play className="w-3 h-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{video.title}</p>
                          {video.duration && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {Math.floor(video.duration / 60)} min
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default CourseView;
