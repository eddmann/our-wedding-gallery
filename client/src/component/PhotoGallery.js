import { useEffect, useState, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Lightbox from './Lightbox';
import LoadingBar from './LoadingBar';

function PhotoGallery({ initialUrl }) {
  const [photos, setPhotos] = useState([]);
  const [nextUrl, setNextUrl] = useState(undefined);
  const [selected, setSelected] = useState(undefined);

  useEffect(() => {
    setNextUrl(initialUrl);
  }, [initialUrl]);

  const doFetch = useCallback(async () => {
    const response = await fetch(nextUrl).then(response => response.json());

    setPhotos(photos => [...photos, ...response.photos]);
    setNextUrl(response?._links?.next?.href);

    return response.photos.length > 0;
  }, [nextUrl]);

  return (
    <>
      <InfiniteScroll loadMore={doFetch} hasMore={!!nextUrl} loader={<LoadingBar />}>
        <div className="grid gap-1 grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {photos.map((photo, idx) => (
            <img
              key={photo.id}
              className="flex object-cover w-full h-full cursor-pointer"
              alt=""
              src={photo.thumbnail}
              onClick={() => setSelected(idx)}
            />
          ))}
        </div>
      </InfiniteScroll>
      <Lightbox
        photo={selected !== undefined && photos[selected]}
        onNext={() => {
          if (selected + 1 < photos.length) {
            setSelected(selected + 1);
            return;
          }

          if (!nextUrl) {
            setSelected(0);
            return;
          }

          doFetch().then(hasMorePhotos => setSelected(hasMorePhotos ? selected + 1 : 0));
        }}
        onClose={() => setSelected(undefined)}
      />
    </>
  );
}

export default PhotoGallery;
