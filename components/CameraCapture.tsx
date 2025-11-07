
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CameraIcon, VideoCameraSlashIcon } from './icons';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check your browser permissions.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureClick = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context){
        // Flip the image horizontally for a mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      onCapture(imageDataUrl);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center">
      <div className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scaleX(-1)" // Mirror effect
        />
        {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <p className="text-white">Starting camera...</p>
            </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center p-4">
            <VideoCameraSlashIcon className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-300">{error}</p>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
      <button
        onClick={handleCaptureClick}
        disabled={!stream || !!error}
        className="mt-6 flex items-center gap-2 px-8 py-3 bg-cyan-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
      >
        <CameraIcon className="w-6 h-6" />
        <span>Take Photo</span>
      </button>
    </div>
  );
};
