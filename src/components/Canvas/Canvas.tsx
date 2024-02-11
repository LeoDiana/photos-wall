import React, { useRef, useEffect, useState, MouseEvent } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from 'localFirebaseInstance';

interface ImageData {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  order: number;
}

interface CanvasProps {
  images: ImageData[];
}

async function updatePhotoPosition(id: string, x:number, y:number) {
  const docRef = doc(db, 'photos', id)
  await updateDoc(docRef, {x, y, order: Date.now()})
}

type PreloadedImages = { [key: string]: HTMLImageElement };

const Canvas: React.FC<CanvasProps> = ({ images }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePositions, setImagePositions] = useState<ImageData[]>(images.sort((a, b) => a.order - b.order));
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [dragStartCoords, setDragStartCoords] = useState<{ x: number; y: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [preloadedImages, setPreloadedImages] = useState<PreloadedImages>({});


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let imagesToLoad = images.length;
    const loadedImages: PreloadedImages = {};

    const onImageLoad = () => {
      imagesToLoad--;
      if (imagesToLoad === 0) {
        setPreloadedImages(loadedImages);
        setImagesLoaded(true);
      }
    };

    const onImageError = (error: any) => {
      console.error('Error loading image:', error);
      onImageLoad();
    };

    images.forEach((imageData) => {
      const image = new Image();
      image.src = imageData.src;
      image.onload = () => {
        loadedImages[imageData.id] = image;
        onImageLoad();
      };
      image.onerror = (error) => {
        onImageError(error);
      };
    });

    const draw = () => {
      if (!imagesLoaded) return;

      context.clearRect(0, 0, canvas.width, canvas.height);
      imagePositions.forEach((imageData) => {
        const image = preloadedImages[imageData.id];
        context.drawImage(image, imageData.x, imageData.y, imageData.width, imageData.height);
      });
    };

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top;
      console.log('imagPo', imagePositions);
      for (let i = imagePositions.length - 1; i >= 0; i--) {
        const imageData = imagePositions[i];

        if (
          mouseX >= imageData.x &&
          mouseX <= imageData.x + imageData.width &&
          mouseY >= imageData.y &&
          mouseY <= imageData.y + imageData.height
        ) {
          setSelectedImageIndex(imagePositions.length-1);

          // Reorder the images so that the selected image is moved to the end of the array
          const updatedImagePositions = [...imagePositions];
          updatedImagePositions.push(updatedImagePositions.splice(i, 1)[0]);
          setImagePositions(updatedImagePositions);

          setDragStartCoords({ x: mouseX - imageData.x, y: mouseY - imageData.y });
          break;
        }
      }
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
      if (selectedImageIndex !== null && dragStartCoords) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newX = mouseX - dragStartCoords.x;
        const newY = mouseY - dragStartCoords.y;

        const newImagePositions = [...imagePositions];
        newImagePositions[selectedImageIndex] = { ...newImagePositions[selectedImageIndex], x: newX, y: newY };
        setImagePositions(newImagePositions);
      }
    };

    const handleMouseUp = () => {
      const {id, x, y} = imagePositions[selectedImageIndex];
      updatePhotoPosition(id, x, y);
      setSelectedImageIndex(null);
      setDragStartCoords(null);

    };

    const animate = () => {
      requestAnimationFrame(animate);
      draw();
    };

    animate();

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
    };
  }, [imagePositions, selectedImageIndex, dragStartCoords, imagesLoaded]);

  return <canvas ref={canvasRef} width={1000} height={1000} />;
};

export default Canvas;
