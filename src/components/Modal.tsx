import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string | string[];
  variant?: 'default' | 'physics' | 'math' | 'chemistry';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  maxHeight?: string;
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
  size = 'lg',
  maxHeight = '90vh',
  onNextTopic,
  onPreviousTopic,
  showNextButton = false,
  showPreviousButton = false,
  image,
  video
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
    default: { headerBg: 'bg-purple-800', borderColor: 'border-purple-500/20' },
    physics: { headerBg: 'bg-blue-600', borderColor: 'border-blue-400/20' },
    math: { headerBg: 'bg-green-600', borderColor: 'border-green-400/20' },
    chemistry: { headerBg: 'bg-red-600', borderColor: 'border-red-400/20' },
  };

  const sizeStyles = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  const formatDescription = (desc: string | string[]) => {
    if (Array.isArray(desc)) {
      return desc.map((item, index) => (
        <React.Fragment key={index}>
          <p className="mb-4 text-lg text-white/90">{item}</p>
          {index < desc.length - 1 && <div className="my-2"></div>}
        </React.Fragment>
      ));
    }
    
    return desc.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-4 text-lg text-white/90">{paragraph}</p>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
      <div 
        className={`${sizeStyles[size]} w-full transform transition-all duration-300 ease-out animate-modal-pop flex flex-col`}
        style={{ maxHeight }}
      >
        <div className={`${variantStyles[variant].headerBg} rounded-t-xl shadow-2xl p-6 sticky top-0 z-10`}>
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-all hover:scale-110"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        <div 
          className={`bg-gradient-to-b from-gray-900 to-gray-800 rounded-b-xl border-t-4 ${variantStyles[variant].borderColor} overflow-y-auto flex-1`}
        >
          <div className="p-8 prose prose-invert max-w-none">

          {image && (
              <div className="mb-6 flex justify-center">
                <img 
                  src={image} 
                  alt={title} 
                  className="max-w-full h-auto rounded-lg border border-gray-600 max-h-[400px] object-contain"
                />
              </div>
            )}

            {video && (
              <div className="mb-6 rounded-lg overflow-hidden">
                {isYouTubeVideo(video) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(video)}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video controls className="w-full">
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            )}
            
        
            {formatDescription(description)}
            <div className="h-16"></div>
          </div>

        </div>

        <div className='flex justify-between p-4 bg-gray-800 rounded-b-xl gap-x-2'>
          {showPreviousButton && onPreviousTopic && (
            <button 
              onClick={onPreviousTopic}
              className='text-white font-medium bg-amber-600 px-6 py-2 hover:bg-amber-800 duration-400 rounded-md flex items-center gap-2'
            >
              <ChevronLeft size={20} />
              Previous Topic
            </button>
          )}
          
          {showNextButton && onNextTopic && (
            <button 
              onClick={onNextTopic}
              className='text-white font-medium bg-amber-600 px-6 py-2 hover:bg-amber-800 duration-400 rounded-md flex items-center gap-2 ml-auto'
            >
              Next Topic
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};