import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string | string[];
  variant?: 'default' | 'physics' | 'math' | 'chemistry';
  onNextTopic?: () => void;
  onPreviousTopic?: () => void;
  showNextButton?: boolean;
  showPreviousButton?: boolean;
  image?: string;
  video?: string;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  variant = 'physics',
  onNextTopic,
  onPreviousTopic,
  showNextButton = false,
  showPreviousButton = false,
  image,
  video
}) => {
  const [fullscreenView, setFullscreenView] = useState<'none' | 'image' | 'video'>('none');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setFullscreenView('none');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const openFullscreen = (type: 'image' | 'video') => {
    setFullscreenView(type);
  };

  const closeFullscreen = () => {
    setFullscreenView('none');
  };

  const isYouTubeVideo = (url?: string) => {
    return url?.includes('youtube.com') || url?.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (url.includes('embed')) return url;
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
    return `https://www.youtube.com/embed/${videoId}`;
  };

  if (!isOpen) return null;

  const variantStyles = {
    default: { 
      headerBg: 'bg-purple-800', 
      borderColor: 'border-purple-500/20',
      textColor: 'text-purple-100'
    },
    physics: { 
      headerBg: 'bg-blue-600', 
      borderColor: 'border-blue-400/20',
      textColor: 'text-blue-100'
    },
    math: { 
      headerBg: 'bg-green-600', 
      borderColor: 'border-green-400/20',
      textColor: 'text-green-100'
    },
    chemistry: { 
      headerBg: 'bg-red-600', 
      borderColor: 'border-red-400/20',
      textColor: 'text-red-100'
    },
  };

const formatDescription = (desc: string | string[]) => {
    const containsEnglish = (text: string) => /[a-zA-Z]/.test(text);

    const formatParagraph = (text: string) => {
        const displayText = containsEnglish(text) ? `\n${text}` : text;
        return (
            <div className="p-4 bg-gray-800/50 rounded-lg">
                <p className={`text-lg ${variantStyles[variant].textColor} whitespace-pre-line`}>
                    {displayText}
                </p>
            </div>
        );
    };

    if (Array.isArray(desc)) {
        return (
            <div className="space-y-4">
                {desc.map((item) => formatParagraph(item))}
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            {desc.split('\n\n').map((paragraph) => formatParagraph(paragraph))}
        </div>
    );
};


  return (
    <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm">
      {/* Full screen container */}
      <div className={`w-full h-full flex flex-col ${fullscreenView !== 'none' ? 'bg-black' : ''}`}>
        {/* Header - hidden when in fullscreen view */}
        {fullscreenView === 'none' && (
          <div className={`${variantStyles[variant].headerBg} p-4 sticky top-0 z-10 flex justify-between items-center`}>
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <div className="flex gap-2">
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-all hover:scale-110"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
              </button>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-all hover:scale-110"
              >
                <X size={28} />
              </button>
            </div>
          </div>
        )}

        {/* Content area */}
        {fullscreenView === 'image' && image ? (
          // Fullscreen image view
          <div className="relative w-full h-full flex items-center justify-center">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-contain cursor-zoom-out"
              onClick={closeFullscreen}
            />
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            >
              <X size={28} />
            </button>
          </div>
        ) : fullscreenView === 'video' && video ? (
          // Fullscreen video view
          <div className="relative w-full h-full flex items-center justify-center">
            {isYouTubeVideo(video) ? (
              <iframe
                src={getYouTubeEmbedUrl(video)}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video controls autoPlay className="w-full h-full">
                <source src={video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/80"
            >
              <X size={28} />
            </button>
          </div>
        ) : (
          // Normal content view
          <>
            <div 
              className={`bg-gradient-to-b from-gray-900 to-gray-800 flex-1 overflow-y-auto ${variantStyles[variant].borderColor} border-t-4`}
            >
              <div className="p-4 md:p-8 max-w-none">
                {/* Media section - image and video side by side */}
                {(image || video) && (
                  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {image && (
                      <div className="relative group">
                        <img 
                          src={image} 
                          alt={title} 
                          className="w-full h-auto max-h-[60vh] object-contain rounded-lg border border-gray-600 cursor-zoom-in transition-transform duration-300 group-hover:scale-95"
                          onClick={() => openFullscreen('image')}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openFullscreen('image')}
                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80"
                            title="View fullscreen"
                          >
                            <Maximize2 size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {video && (
                      <div className="relative group">
                        {isYouTubeVideo(video) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(video)}
                            className="w-full h-[60vh] rounded-lg border border-gray-600"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          />
                        ) : (
                          <video 
                            controls 
                            className="w-full h-auto max-h-[60vh] rounded-lg border border-gray-600"
                          >
                            <source src={video} type="video/mp4" />
                          </video>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => openFullscreen('video')}
                            className="p-2 bg-black/50 rounded-full text-white hover:bg-black/80"
                            title="View fullscreen"
                          >
                            <Maximize2 size={24} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Description section */}
                <div className="mt-8">
                  {/* <h3 className={`text-xl font-semibold mb-4 ${variantStyles[variant].textColor}`}>Description</h3> */}
                  {formatDescription(description)}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='flex justify-between p-4 bg-gray-800 gap-x-2'>
              {showPreviousButton && onPreviousTopic && (
                <button 
                  onClick={onPreviousTopic}
                  className={`text-white font-medium ${variantStyles[variant].headerBg} px-6 py-2 hover:opacity-90 transition-opacity rounded-md flex items-center gap-2`}
                >
                  <ChevronLeft size={20} />
                  Previous Topic
                </button>
              )}
              
              {showNextButton && onNextTopic && (
                <button 
                  onClick={onNextTopic}
                  className={`text-white font-medium ${variantStyles[variant].headerBg} px-6 py-2 hover:opacity-90 transition-opacity rounded-md flex items-center gap-2 ml-auto`}
                >
                  Next Topic
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};