import React from "react";
import { Howl, Howler } from "howler";
import { AudioPlayingState } from "./types";
import { AudioSlider } from "./AudioSlider";

Howler.autoSuspend = false;

const EMPTY_AUDIO_URL = "/1-second-of-silence.mp3";
const BACKGROUND = "/background.mp3";
const NARRATION = "/narration.mp3";

interface State {
  unlocked: boolean;
  duration: number;
  seekPos: number;
  playingState: AudioPlayingState;
}
class App extends React.Component<any, State> {
  state = {
    unlocked: false,
    duration: 0,
    seekPos: 0,
    playingState: AudioPlayingState.loading,
  };

  audioRef = React.createRef<HTMLAudioElement>();

  narration: Howl | null = null;

  music: Howl | null = null;

  componentDidMount() {
    this.narration = new Howl({
      src: NARRATION,
      loop: true,
      html5: true,
      autoplay: false,
      onload: () => {
        if (this.narration) {
          this.setState({
            playingState: AudioPlayingState.idle,
            duration: Math.floor(this.narration.duration()),
          });
        }
      },
      onend: () => {
        this.setState({
          playingState: AudioPlayingState.completed,
          seekPos: 0,
        });
      },
      onpause: () => {
        this.setState({ playingState: AudioPlayingState.paused });
      },
      onplay: () => {
        if (this.narration) {
          this.setState({
            playingState: AudioPlayingState.playing,
            duration: Math.floor(this.narration.duration()),
          });
          this.step();
        }
      },
    });
    this.music = new Howl({
      src: BACKGROUND,
      loop: true,
      html5: false,
      volume: 0.1,
      autoplay: false,
    });
  }

  step = () => {
    if (!this.narration) {
      return;
    }

    const seekPos = this.narration.seek();

    if (typeof seekPos === "number") {
      this.setState({ seekPos });
    }

    const isPlaying = this.narration.playing();

    if (isPlaying) {
      // continue stepping
      requestAnimationFrame(this.step);
    }
  };

  pause = () => {
    if (this.narration) {
      this.narration.pause();
    }
  };

  play = () => {
    if (this.narration) {
      if (Howler.ctx) {
        Howler.ctx.resume();
      }

      const isPlaying = this.narration.playing();

      if (!isPlaying) {
        this.narration.play();
      }
    }
  };

  seek = (value: number) => {
    if (!this.narration) {
      return;
    }

    this.narration.seek(value);

    this.setState({ seekPos: value });
  };

  componentWillUnmount() {
    if (this.narration) {
      this.narration.unload();
    }

    if (this.music) {
      this.music.unload();
    }
  }

  startPlay = () => {
    console.log("play");

    if (this.audioRef.current) {
      console.log("playing");

      this.audioRef.current.play();
    }

    if (this.music) {
      this.music.play();
    }

    if (this.narration) {
      this.narration.play();
    }
  };

  render() {
    return (
      <div>
        <button onClick={this.startPlay}>Start everything</button>

        {this.state.unlocked && (
          <>
            <p>Length: {this.state.duration.toFixed(2)} seconds</p>

            <button
              onClick={() => {
                if (this.state.playingState === AudioPlayingState.playing) {
                  this.pause();
                } else {
                  this.play();
                }
              }}
            >
              {this.state.playingState === AudioPlayingState.playing
                ? "Pause"
                : "Play"}
            </button>

            <AudioSlider
              seek={this.seek}
              seekPos={this.state.seekPos}
              length={this.state.duration}
              playingState={this.state.playingState}
              pause={this.pause}
              play={this.play}
            />
          </>
        )}

        <audio
          ref={this.audioRef}
          src={EMPTY_AUDIO_URL}
          loop={true}
          onPlaying={() => {
            this.setState({ unlocked: true });
          }}
          autoPlay={false}
        />
      </div>
    );
  }
}

export default App;
