import { ChangeEvent, useEffect, useRef, useState } from 'react';
import useUpload from './hooks/useUpload.ts';
import UploadWrapper from './components/UploadWrapper';
import Canvas from './components/Canvas';
// import { collection, addDoc } from 'firebase/firestore'
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  QueryFieldFilterConstraint,
  addDoc
} from 'firebase/firestore'

import { db } from 'localFirebaseInstance'

const URL ='https://firebasestorage.googleapis.com/v0/b/fir-uploading-project.appspot.com/o/user-photos%2F6a2908a2-4569-4205-afef-dac59ade134c?alt=media&token=c51ec1ed-4058-41f2-a962-19cb881b56f2'
const URL2 ='https://firebasestorage.googleapis.com/v0/b/fir-uploading-project.appspot.com/o/user-photos%2F82e8da5a-114d-40ed-8bdf-926db8c765b3?alt=media&token=2c7b99d4-3f6c-4067-8652-0a19faf686a4'

async function addPhoto(src: string) {
  const docRef = collection(db, 'photos')
    await addDoc(docRef, { src,  width: 200, height: 200, x: 0, y:0})
}

async function getPhotos() {
  const photosQuery = query(collection(db, 'photos'))
  const photosSnapshot = await getDocs(photosQuery)
  const photos = photosSnapshot.docs.map(d => ({
    ...d.data(),
    id: d.id,
  }))

  return (await Promise.all(photos))
}

function App() {
  const { handleChange, urls } = useUpload();
  const [photos, setPhotos] = useState([]);
  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    if(urls[0] !== 'loading') {
      addPhoto(urls[0])
    }
  }, [urls]);

  useEffect(() => {
    (async ()=> {
      console.log(await getPhotos());
      setPhotos( await getPhotos());
    })()
  }, []);

  // [{ src: URL, x: 100, y: 100, width: 200, height: 200, id: '1' }, { src: URL2, x: 300, y: 100, width: 200, height: 200, id: '2'}]
    console.log(urls, photos);

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <Canvas images={photos} key={JSON.stringify(photos)}/>
      <UploadWrapper onChange={handleUpload}>
        <div className='rounded-lg px-4 py-2 border-2 border-gray-300 font-medium fixed bottom-2 -translate-x-1/2 left-1/2'>Upload</div>
      </UploadWrapper>
    </div>
  )
}

export default App
