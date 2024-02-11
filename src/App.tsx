import { ChangeEvent, useEffect, useState } from 'react';
import useUpload from './hooks/useUpload.ts';
import UploadWrapper from './components/UploadWrapper';
import Canvas from './components/Canvas';
import {
  collection,
  getDocs,
  query,
  addDoc, doc, updateDoc
} from 'firebase/firestore';

import { db } from 'localFirebaseInstance'
import { useParams } from 'react-router-dom';


async function addPhoto(src: string, wallId='photos') {
  const docRef = collection(db, wallId)
  await addDoc(docRef, { src,  width: 200, height: 200, x: 0, y:0})
}

async function getPhotos(wallId = 'photos') {
  console.log(wallId);
  const photosQuery = query(collection(db, wallId))
  const photosSnapshot = await getDocs(photosQuery)
  const photos = photosSnapshot.docs.map(d => ({
    ...d.data(),
    id: d.id,
  }))

  return (await Promise.all(photos))
}

async function updatePhotoPosition(id: string, x: number, y: number, wallId = 'photos') {
  console.log(wallId);
  const docRef = doc(db, wallId, id);
  await updateDoc(docRef, { x, y, order: Date.now() });
}

function App() {
  const { wallId } = useParams() as { wallId: string }
  const { handleChange, urls } = useUpload();
  const [photos, setPhotos] = useState([]);
  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    handleChange(event)
  }

  useEffect(() => {
    if(urls.length && urls[0] !== 'loading') {
      addPhoto(urls[0], wallId)
    }
  }, [urls]);

  useEffect(() => {
    (async ()=> {
      setPhotos( await getPhotos(wallId));
    })()
  }, []);

  return (
    <div>
      <h1 className='text-3xl text-center mt-2'>My wall</h1>
      <Canvas images={photos} key={JSON.stringify(photos)} updatePhotoPosition={(id: string, x: number, y: number) =>
        updatePhotoPosition(id, x, y, wallId)
      }/>
      <UploadWrapper onChange={handleUpload}>
        <div className='rounded-lg px-4 py-2 border-2 border-gray-300 font-medium fixed bottom-2 -translate-x-1/2 left-1/2'>Upload</div>
      </UploadWrapper>
    </div>
  )
}

export default App
