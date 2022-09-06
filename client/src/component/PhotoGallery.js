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
    setNextUrl(response._links.next ? response._links.next.href.replace('api/', 'api') : undefined);
  }, [nextUrl]);

  return (
    <>
      <InfiniteScroll loadMore={doFetch} hasMore={!!nextUrl} loader={<LoadingBar />}>
        <div className="grid gap-1 grid-cols-2 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
          {photos.map(photo => (
            <img
              key={photo.id}
              className="flex object-cover w-full h-full cursor-pointer"
              alt=""
              src={photo.thumbnail}
              onClick={() => setSelected(photo)}
            />
          ))}
        </div>
      </InfiniteScroll>
      <Lightbox photo={selected} onClose={() => setSelected(undefined)} />
    </>
  );
}

export default PhotoGallery;
