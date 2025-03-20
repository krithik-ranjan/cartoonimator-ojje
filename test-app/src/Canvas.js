import React, {useState, useRef, useEffect} from "react";

import capture from './assets/capture-button.svg';
import fullscreen from './assets/fullscreen-button.svg';
import deleteImg from './assets/delete-zone.svg';

const CanvasEditor = ({ mode, setMode, scene, keyframes, setKeyframes }) => {
  const FPS = 20;
  
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const sceneImg = new Image();
  const objectsRef = useRef(new Map());
  // const [objects, setObjects] = useState([]);
  const [draggingIndex, setDraggingIndex] = useState(null);
  const [deleteActive, setDeleteActive] = useState(false);

  const frameIndexRef = useRef(0);
  console.log(`Mode: ${mode}`)


  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    let animationInterval;

    if (scene) {
      sceneImg.src = scene; 

      sceneImg.onload = () => {
        console.log("Scene loaded");
      }
    }

    const draw = () => {
      ctx.clearRect(0,0, canvas.width, canvas.height);
      if (mode === "edit") {
        if (sceneImg.complete && scene) {
          // console.log(`Drawing scene: ${scene}`)
          // sceneRef.current; 
    
          let imgHeight = canvas.height;
          let imgWidth = (sceneImg.width / sceneImg.height) * imgHeight;
          ctx.drawImage(sceneImg, 0, 0, imgWidth, imgHeight);

          objectsRef.current.forEach((obj, id) => {
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
          // console.log("No scene")
          ctx.fillStyle = "rgb(200 0 0)";
          ctx.fillRect(10, 10, 50, 50);
      
          ctx.fillStyle = "#614bc388";
          ctx.fillRect(30, 30, 50, 50);

          ctx.font = "24px sans-serif";
          ctx.fillStyle = "#614bc3";
          ctx.fillText("Select a scene and drag characters onto it to start animating.", 100, 60);
        }
      } else if (mode === "play") {
        if (keyframes.length > 1) {
          if (frameIndexRef.current >= FPS * keyframes.length){
            frameIndexRef.current = 0;
            setMode("edit");
          }
          else {
            // Find the last keyframe and display its scene
            let currentKf = Math.floor(frameIndexRef.current / FPS);
            console.log(`Frame index: ${frameIndexRef.current}, Kf: ${currentKf}, Scene: ${keyframes[currentKf].sceneSrc}`);

            let currentScene = new Image();
            currentScene.src = keyframes[currentKf].sceneSrc;
            if (!currentScene.complete) {
              console.log("Scene not loaded");
              return;
            }
            let imgHeight = canvas.height;
            let imgWidth = (currentScene.width / currentScene.height) * imgHeight;
            ctx.drawImage(currentScene, 0, 0, imgWidth, imgHeight)

            // If last keyframe, just show static objects
            if (currentKf === keyframes.length - 1) {
              keyframes[currentKf].objects.forEach((obj, id) => {
                if (obj.image.complete) {
                  ctx.drawImage(obj.image, obj.x, obj.y, 150, 150);
                }
              });
            } else {    // Else, interpolate
              keyframes[currentKf].objects.forEach((obj, id) => {
                if (obj.image.complete) {
                  // Check if same object in next keyframe
                  if (keyframes[currentKf + 1].objects.has(id)) {
                    let nextObj = keyframes[currentKf + 1].objects.get(id);
                    let currTime = frameIndexRef.current - (currentKf * FPS);

                    let currX = obj.x + Math.floor((nextObj.x - obj.x) * (currTime / FPS));
                    let currY = obj.y + Math.floor((nextObj.y - obj.y) * (currTime / FPS));
                    ctx.drawImage(obj.image, currX, currY, 150, 150);
                  } else {
                    ctx.drawImage(obj.image, obj.x, obj.y, 150, 150);
                  }
                }
              })
            }

            
          }
        } else {
          // console.log("No scene")
          ctx.fillStyle = "rgb(200 0 0)";
          ctx.fillRect(10, 10, 50, 50);
      
          ctx.fillStyle = "#614bc388";
          ctx.fillRect(30, 30, 50, 50);

          ctx.font = "24px sans-serif";
          ctx.fillStyle = "rgb(200 0 0)";
          ctx.fillText("Not enough keyframes captured.", 100, 60);
        }
      }
    }

    // Display animation at 20FPS --> update frame index every 50ms
    if (mode === "play") {
      frameIndexRef.current = 0;
      animationInterval = setInterval(() => {
        frameIndexRef.current = frameIndexRef.current + 1;
      }, 1000 / FPS);
    }

    let animationFrameId;
    const animate = () => {
      draw();
      animationFrameId = window.requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      clearInterval(animationInterval);
    }
    
  }, [mode, scene]);

  const handleDrop = (e) => {
    e.preventDefault();
    const newImgSrc = e.dataTransfer.getData("text");

    const id = `obj-${Date.now().toString()}`;
    const newImg = new Image();
    newImg.src = newImgSrc;
    newImg.onload = () => console.log(`Added and loaded object ${newImgSrc}`);
    // setObjects((prevObjects) => [
    //     ...prevObjects,
    //     { src: newImg, x: 50, y: 50},
    // ]);
    objectsRef.current.set(id, { id, src: newImgSrc, x: 50, y: 50, image: newImg});
    // console.log("Added object")
  };

  const handleMouseDown = (e) => {
    const offX = e.nativeEvent.clientX;
    const offY = e.nativeEvent.clientY;
    
    let clickedObj = null;
    objectsRef.current.forEach((obj, id) => {
      if ( 
        offX - 75 >= obj.x &&
        offX - 75 <= obj.x + 150 && 
        offY - 75 >= obj.y && 
        offY - 75 <= obj.y + 150
      ) {
        clickedObj = id;
      }
    });

    // console.log(objects);
    // console.log(`Found object index: ${clickedIndex}; Mouse click at ${offX}, ${offY}`);
    
    if (clickedObj !== null)
        setDraggingIndex(clickedObj);
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
      objectsRef.current.set(draggingIndex, {
        ...objectsRef.current.get(draggingIndex),
        x: offX - 75,
        y: offY - 150,
      });

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

        // objectsRef.current.splice(draggingIndex, 1);
        objectsRef.current.delete(draggingIndex);
      }
    }

    setDraggingIndex(null);
    setDeleteActive(false);
  }

  const captureKeyframe = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageURL = canvas.toDataURL("image/png");
    console.log("Image capture saved")

    setKeyframes((prev) => [...prev, {url: imageURL, scene: sceneImg, sceneSrc: scene, objects: new Map(objectsRef.current)}])
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
        onClick={() => {captureKeyframe()}}
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