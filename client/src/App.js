import { useEffect, useState } from 'react';
import LoadingBar from './component/LoadingBar';
import PhotoUpload from './component/PhotoUpload';
import PhotoGallery from './component/PhotoGallery';
import logo from './logo.svg';

function App({ bootstrapUrl }) {
  const [bootstrap, setBootstrap] = useState(undefined);

  useEffect(() => {
    fetch(bootstrapUrl)
      .then(response => response.json())
      .then(({ _links }) => setBootstrap(_links));
  }, [bootstrapUrl]);

  if (!bootstrap) {
    return <LoadingBar />;
  }

  return (
    <>
      <div className="mt-10 mb-10 flex justify-center">
        <img src={logo} alt="" />
      </div>
      <div className="mt-10 mb-10 flex justify-center">
        {bootstrap.request && (
          <PhotoUpload
            url={bootstrap.request.href}
            onUpload={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
      <PhotoGallery initialUrl={bootstrap.self.href} />
    </>
  );
}

export default App;
