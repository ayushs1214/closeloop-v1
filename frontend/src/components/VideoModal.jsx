import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Play, Pause, Maximize2 } from "lucide-react";

const VideoModal = ({ isOpen, onClose, videoUrl, title = "Product Demo" }) => {
  const [isPlaying, setIsPlaying] = useState(true);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal Content */}
      <div 
        className="relative w-full max-w-5xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-white font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        {/* Video Container */}
        <div className="relative aspect-video bg-black">
          {videoUrl ? (
            <iframe
              src={videoUrl}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={title}
            />
          ) : (
            /* Placeholder Demo Video */
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-slate-700 transition-colors cursor-pointer">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <h4 className="text-white text-xl font-medium mb-2">CloseLoop Product Demo</h4>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  See how CloseLoop transforms post-call chaos into completed work in under 60 seconds.
                </p>
                <div className="mt-8 flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    Demo video coming soon
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer with demo highlights */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <span>✓ Call Review walkthrough</span>
              <span>✓ Data Vault demo</span>
              <span>✓ Approval workflow</span>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VideoTrigger = ({ onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative inline-flex items-center gap-3 ${className}`}
    >
      <div className="relative">
        {/* Pulse rings */}
        <div className="absolute inset-0 rounded-full bg-slate-900/20 animate-ping" />
        <div className="relative w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center group-hover:bg-slate-800 transition-colors shadow-lg">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
        Watch demo
      </span>
    </button>
  );
};

export const InlineVideoPlayer = ({ className = "" }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className={`relative aspect-video rounded-xl overflow-hidden bg-slate-900 ${className}`}>
      {!isPlaying ? (
        <div 
          className="absolute inset-0 flex items-center justify-center cursor-pointer group"
          onClick={() => setIsPlaying(true)}
        >
          {/* Thumbnail/Preview */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDIwMjAiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptMC02aC00di00aDR2NHptLTYgMTJoLTR2Mmg0di0yem0wLTZ2LTRoLTR2NGg0em0wLTZoLTR2LTRoNHY0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
          </div>
          
          {/* Play Button */}
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/50 rounded text-white text-xs">
            2:34
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-slate-400">Video player placeholder</p>
        </div>
      )}
    </div>
  );
};

export default VideoModal;
