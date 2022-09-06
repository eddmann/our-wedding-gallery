import { useEffect } from 'react';

function Lightbox({ photo, onClose }) {
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
      <img
        alt=""
        className="max-h-[90vh]"
        src={photo.web}
        onClick={e => {
          e.stopPropagation();
        }}
      />
    </div>
  );
}

export default Lightbox;
