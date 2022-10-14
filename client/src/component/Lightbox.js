import { useCallback, useEffect, useState } from 'react';

function Photo({ src, onClick, onSwipeLeft, onSwipeRight, minSwipeDistance = 150 }) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = useCallback(e => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback(e => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchEnd === 0) return;
    if (touchStart - touchEnd > minSwipeDistance) onSwipeLeft();
    if (touchStart - touchEnd < -minSwipeDistance) onSwipeRight();
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, minSwipeDistance, onSwipeLeft, onSwipeRight]);

  return (
    <img
      alt=""
      className="max-h-[90vh]"
      src={src}
      style={{ marginLeft: touchEnd !== 0 ? touchEnd - touchStart : 0 }}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}

function Lightbox({ photo, onNext, onPrevious, onClose }) {
  useEffect(() => {
    if (!photo) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [photo]);

  if (!photo) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 z-80 w-screen h-screen flex justify-center items-center bg-black/70"
      onClick={onClose}
    >
      <button
        className="fixed z-90 top-6 right-8 text-white text-5xl font-bold cursor-pointer"
        onClick={onClose}
      >
        &times;
      </button>
      <Photo
        src={photo.web}
        onClick={e => {
          e.stopPropagation();
          onNext();
        }}
        onSwipeLeft={onNext}
        onSwipeRight={onPrevious}
      />
    </div>
  );
}

export default Lightbox;
