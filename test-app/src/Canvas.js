import React, {useState, useRef, useEffect} from "react";

import capture from './assets/capture-button.svg';
import fullscreen from './assets/fullscreen-button.svg';
import deleteImg from './assets/delete-zone.svg';

const CanvasEditor = ({ scene }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const objectsRef = useRef([]);
  // const [objects, setObjects] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [deleteActive, setDeleteActive] = useState(false);

  useEffect(() => {
    console.log("Animation running")
    // console.log(sceneRef.current);

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const sceneImg = new Image();
    if (scene) {
      sceneImg.src = scene; 

      sceneImg.onload = () => {
        console.log("Scene loaded");
      }
    }

    const draw = () => {
      ctx.clearRect(0,0, canvas.width, canvas.height);

      if (sceneImg.complete && scene) {
        // console.log(`Drawing scene: ${scene}`)
        // sceneRef.current; 
  
        let imgHeight = canvas.height;
        let imgWidth = (sceneImg.width / sceneImg.height) * imgHeight;
        ctx.drawImage(sceneImg, 0, 0, imgWidth, imgHeight);

        objectsRef.current.forEach((obj) => {
          if (obj.image.complete) {
            ctx.drawImage(obj.image, obj.x, obj.y, 150, 150);
          }

          // const obj = new Image();
          // obj.src = img.src;
          // obj.onload = () => {
          //     ctx.drawImage(obj, img.x, img.y, 100, 100);
          // };
        });

      }
      if (!scene) {
        console.log("No scene")
        ctx.fillStyle = "rgb(200 0 0)";
        ctx.fillRect(10, 10, 50, 50);
    
        ctx.fillStyle = "#614bc388";
        ctx.fillRect(30, 30, 50, 50);

        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#614bc3";
        ctx.fillText("Select a scene and drag characters onto it to start animating.", 100, 60);
      }
    }

    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    }
    
  }, [scene]);

  const handleDrop = (e) => {
    e.preventDefault();
    const newImgSrc = e.dataTransfer.getData("text");

    const newImg = new Image();
    newImg.src = newImgSrc;
    newImg.onload = () => console.log(`Added and loaded object ${newImgSrc}`);
    // setObjects((prevObjects) => [
    //     ...prevObjects,
    //     { src: newImg, x: 50, y: 50},
    // ]);
    objectsRef.current.push({ src: newImgSrc, x: 50, y: 50, image: newImg});
    // console.log("Added object")
  };

  const handleMouseDown = (e) => {
    const offX = e.nativeEvent.clientX;
    const offY = e.nativeEvent.clientY;
    const clickedIndex = objectsRef.current.findIndex(
        (img) => 
            offX - 75 >= img.x &&
            offX - 75 <= img.x + 150 && 
            offY - 75 >= img.y && 
            offY - 75 <= img.y + 150
    );

    // console.log(objects);
    // console.log(`Found object index: ${clickedIndex}; Mouse click at ${offX}, ${offY}`);
    
    if (clickedIndex !== -1)
        setDraggingIndex(clickedIndex);
  };

  const handleMouseMove = (e) => {
    if (draggingIndex !== null) {
      const offX = e.nativeEvent.clientX;
      const offY = e.nativeEvent.clientY;
      // setObjects((prevObjects) =>
      //     prevObjects.map((img, index) =>
      //         index === draggingIndex ? { ...img, x: offX - 50, y: offY - 50} : img        
      //     )
      // );
      objectsRef.current[draggingIndex] = {
        ...objectsRef.current[draggingIndex],
        x: offX - 75,
        y: offY - 150,
      }

      setDeleteActive(true)
    }
  };

  const handleMouseUp = (e) => {
    // Check if dragged object in the delete zone and delete
    if (draggingIndex !== null) {
      const offX = e.nativeEvent.clientX;
      const offY = e.nativeEvent.clientY;

      const canvas = canvasRef.current;

      if (offX > canvas.width - 200 && offY > canvas.height - 200) {
        console.log(`Object ${draggingIndex} in delete zone`);

        objectsRef.current.splice(draggingIndex, 1);
      }
    }

    setDraggingIndex(null);
    setDeleteActive(false);
  }

  return (
    <div className='CanvasEditor' ref={containerRef}
        onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
        onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} style={{width: "100%", height: "100%"}} 
        onMouseDown={handleMouseDown} />

      <img
        className='CaptureBtn'
        src={capture}
        alt='Capture Button'
      />
      <img 
        className='MaximizeBtn'
        src={fullscreen}
        alt='Full screen'
      />
      { deleteActive && 
      <img
        className='DeleteZone'
        src={deleteImg}
        alt='Delete zone'
      />}
    </div>
  )
} 

export default CanvasEditor;