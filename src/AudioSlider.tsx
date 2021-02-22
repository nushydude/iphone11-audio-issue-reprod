import React, { useState } from "react";
import styled from "styled-components";
import { AudioPlayingState } from "./types";

interface AudioSliderProps {
  seek: (value: number) => void;
  seekPos: number;
  length: number;
  playingState: AudioPlayingState;
  pause: () => void;
  play: () => void;
}

export const AudioSlider: React.FC<AudioSliderProps> = ({
  seek,
  seekPos,
  length,
  playingState,
  pause,
  play,
}) => {
  const [
    previousPlayingState,
    setPreviousPlayingState,
  ] = useState<AudioPlayingState | null>();

  const handleClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    seek(value * 0.1);
  };

  // if playing, pause the narration until mouse up
  // but store the previous playing state
  const onMouseDown = () => {
    setPreviousPlayingState(playingState);

    if (playingState === AudioPlayingState.playing) {
      pause();
    }
  };

  const onMouseUp = () => {
    // if audio was playing when mouse down was pressed, ]
    // resume playback
    if (previousPlayingState === AudioPlayingState.playing) {
      play();
    }
  };

  const position = length === 0 ? 0 : (seekPos * 100) / length;

  return (
    <Slider
      type="range"
      id="points"
      name="points"
      min="0"
      // this adds a bit of resolution when sliding, but doesn't affect the resolution of playtiume progress.
      max={length * 10}
      value={seekPos * 10}
      onChange={handleClick}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
      onMouseUp={onMouseUp}
      onTouchEnd={onMouseUp}
      position={position}
      interactive={length > 0}
    />
  );
};

const Slider = styled.input.attrs<{
  position: number;
}>((props) => ({
  style: {
    background: `linear-gradient(to right, #000000 0%, #000000 ${props.position}%, #D1D1D1 ${props.position}%, #D1D1D1 100%)`,
  },
}))<{ position: number; interactive: boolean }>`
  outline: none;
  align-items: center;
  appearance: none;
  background: #d1d1d1;
  cursor: pointer;
  display: flex;
  height: 4px;
  width: 100%;
  pointer-events: ${(props) => (props.interactive ? "all" : "none")};

  &::-webkit-slider-thumb {
    border: 1px solid #000000;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffee;
    cursor: pointer;
    appearance: none;
    margin-top: -6px;
  }

  &::-webkit-slider-runnable-track {
    height: 4px;
    content: "";
    outline: none;
  }

  &::-moz-range-thumb {
    border: 1px solid #000000;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffee;
    cursor: pointer;
    position: relative;
    outline: none;
  }

  &::-moz-range-progress {
    height: 4px;
    background: #000000;
    border: 0;
    margin-top: 0;
    outline: none;
  }

  &::-moz-range-track {
    width: 100%;
    height: 4px;
    background: #d1d1d1;
    outline: none;
  }

  &::-ms-track {
    background: transparent;
    border: 0;
    border-color: transparent;
    border-radius: 0;
    border-width: 0;
    color: transparent;
    height: 4px;
    margin-top: 10px;
    width: 100%;
  }

  &::-ms-thumb {
    border: 1px solid #000000;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffee;
    cursor: pointer;
  }

  &::-ms-tooltip {
    display: none;
  }

  &::-ms-fill-lower {
    background: #000000;
    border-radius: 0;
  }

  &::-ms-fill-upper {
    background: #d1d1d1;
    border-radius: 0;
  }
`;
