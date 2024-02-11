import React, { useRef, useEffect, useState, MouseEvent } from 'react';

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
  updatePhotoPosition: (id: string, x: number, y: number) => void;
}

type PreloadedImages = { [key: string]: HTMLImageElement };

const Canvas: React.FC<CanvasProps> = ({ images, updatePhotoPosition }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePositions, setImagePositions] = useState<ImageData[]>(images.sort((a, b) => a.order - b.order));
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [dragStartCoords, setDragStartCoords] = useState<{ x: number; y: number } | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState<boolean>(false);
  const [preloadedImages, setPreloadedImages] = useState<PreloadedImages>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [canvasOffset, setCanvasOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

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
        context.drawImage(
          image,
          imageData.x + canvasOffset.x,
          imageData.y + canvasOffset.y,
          imageData.width,
          imageData.height
        );
      });
    };

    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
      const mouseX = e.clientX - canvas.getBoundingClientRect().left - canvasOffset.x;
      const mouseY = e.clientY - canvas.getBoundingClientRect().top - canvasOffset.y;

      // Check if any image is clicked
      let imageClicked = false;
      for (let i = imagePositions.length - 1; i >= 0; i--) {
        const imageData = imagePositions[i];

        if (
          mouseX >= imageData.x &&
          mouseX <= imageData.x + imageData.width &&
          mouseY >= imageData.y &&
          mouseY <= imageData.y + imageData.height
        ) {
          // Reorder the images so that the selected image is moved to the end of the array
          const updatedImagePositions = [...imagePositions];
          updatedImagePositions.push(updatedImagePositions.splice(i, 1)[0]);
          setImagePositions(updatedImagePositions);
          setSelectedImageIndex(imagePositions.length-1);

          setDragStartCoords({ x: mouseX - imageData.x, y: mouseY - imageData.y });
          imageClicked = true;
          break;
        }
      }

      // If no image is clicked, initiate hand-dragging
      if (!imageClicked) {
        setIsDragging(true);
        setDragStartCoords({ x: mouseX, y: mouseY });
      }
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
      if (selectedImageIndex !== null && dragStartCoords) {
        // Move the selected image
        const mouseX = e.clientX - canvas.getBoundingClientRect().left - canvasOffset.x;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top - canvasOffset.y;

        const newX = mouseX - dragStartCoords.x;
        const newY = mouseY - dragStartCoords.y;

        const newImagePositions = [...imagePositions];
        newImagePositions[selectedImageIndex] = { ...newImagePositions[selectedImageIndex], x: newX, y: newY };
        setImagePositions(newImagePositions);
      } else if (isDragging && dragStartCoords) {
        // Hand-drag the canvas
        const mouseX = e.clientX - canvas.getBoundingClientRect().left - canvasOffset.x;
        const mouseY = e.clientY - canvas.getBoundingClientRect().top - canvasOffset.y;


        const offsetX = mouseX - dragStartCoords.x;
        const offsetY = mouseY - dragStartCoords.y;

        setCanvasOffset((prevOffset) => ({
          x: prevOffset.x + offsetX,
          y: prevOffset.y + offsetY,
        }));
      }
    };

    const handleMouseUp = () => {
      if(selectedImageIndex !== null) {
        const { id, x, y } = imagePositions[selectedImageIndex];
        updatePhotoPosition(id, x, y);
      }
      setSelectedImageIndex(null);
      setDragStartCoords(null);
      setIsDragging(false);
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
  }, [imagePositions, imagesLoaded, canvasOffset, isDragging, dragStartCoords]);

  return <canvas ref={canvasRef} width={800} height={800} style={{ cursor: isDragging ? 'grabbing' : 'grab' }} />;
};

export default Canvas;
