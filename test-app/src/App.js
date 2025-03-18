import React, { useState, useEffect, useRef } from "react";

import logo from './assets/logo-full.svg';
import play from './assets/play-circle.svg';
import pause from './assets/pause-circle.svg';
import download from './assets/download-circle.svg';

import { AnimationScenes, AnimationObjects } from './Assets';
import CanvasEditor from "./Canvas";

import './App.css';

export default function App() {
  return (
    <div className="App">
      <Titlebar />
      <Storyboard />
      <Editor />
    </div>
  );
}

const Titlebar = () => {
  return (
    <div className='Titlebar'>
      <img
        className='AppLogo'
        src={logo}
        alt='App Logo'
      />
    </div>
  )
}

const Storyboard = () => {
  const [selectedScene, setSelectedScene] = useState(null);

  return (
    <div className='Storyboard'>
      <CanvasEditor scene={selectedScene} />
      <AssetGallery selectedScene={selectedScene} onSelectScene={setSelectedScene} />
    </div>
  )
}

const AssetGallery = ({ selectedScene, onSelectScene, onDragObject }) => {
  const handleClick = (image) => {
    if (selectedScene === image ) {
      onSelectScene(null);
    }
    else {
      onSelectScene(image);
      console.log(`Selected image ${image}`)
    }
  }

  return (
    <div className='AssetGallery'>
      <h2>Scenes</h2>
      <div className='SceneGallery'>
        {Object.keys(AnimationScenes).map((key) => {
          const isSelected = (selectedScene === AnimationScenes[key]);

          if (isSelected) {
          return (
            <div className='SceneImg SceneSelected'>
              <img key={key} src={AnimationScenes[key]} alt={key}
                onClick={() => handleClick(AnimationScenes[key])} />
            </div>
          );
          } else {
          return ( 
            <div className='SceneImg'>
              <img key={key} src={AnimationScenes[key]} alt={key}
                onClick={() => handleClick(AnimationScenes[key])} />
            </div>
          );
          }
        })}
      </div>
      <h2>Characters</h2>
      <div className='ObjectGallery'>
        {Object.keys(AnimationObjects).map((key) => (
          <div className='ObjectImg'>
            <img key={key} src={AnimationObjects[key]} alt={key}
              draggable="true" onDragStart={(e) => e.dataTransfer.setData("text", AnimationObjects[key])}/>
          </div>
        ))}
      </div>
    </div>
  )
}

const Editor = () => {
  return (
    <div className='Editor'>
      <div className='TimelineControls'>
        <img
          className='PlayButton'
          src={play}
          alt='Play button'
        />
        <img
          className='PauseButton'
          src={pause}
          alt='Pause button'
        />
        <img
          className='DownloadButton'
          src={download}
          alt='Download button'
        />
      </div>
      <Timeline />
    </div>
  )
}

const Timeline = ({totalTicks = 59, tickSpacing = 30, labelEvery = 10}) => {
  return (
    <div className="Timeline">
      {/* Ticks container */}
      <div className="TimelineTicks">
        {Array.from({ length: totalTicks }, (_, i) => (
          <div 
            key={i} 
            className="Tick"
            style={{ left: `${i * tickSpacing}px` }} // Exact positioning
          >
            <div className="TickLine"></div>
          </div>
        ))}
      </div>

      {/* Labels container */}
      <div className="TimelineLabels">
        {Array.from({ length: Math.floor(totalTicks / labelEvery) + 1 }, (_, i) => (
          <div 
            key={i} 
            className="TickLabel"
            style={{ left: `${i * labelEvery * tickSpacing}px` }} // Exact positioning
          >
            {i * labelEvery / 10}s
          </div>
        ))}
      </div>
    </div>
  );
}