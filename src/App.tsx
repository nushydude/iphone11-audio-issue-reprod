import React from "react";
import { Howl, Howler } from "howler";
import { AudioPlayingState } from "./types";
import { AudioSlider } from "./AudioSlider";

Howler.autoSuspend = false;

const CACHE = "audio_cache";

const EMPTY_AUDIO_URL = "/1-second-of-silence.mp3";
const BACKGROUND =
  "https://gaia.lithodomos.com/633059a6a4545d6f271b7795753cf16f.mp3";
const NARRATION =
  "https://gaia.lithodomos.com/a4fe809785cde716d7ce06c67ade1d9a.mp3";

interface State {
  unlocked: boolean;
  duration: number;
  seekPos: number;
  playingState: AudioPlayingState;
  cached: boolean;
}
class App extends React.Component<any, State> {
  state = {
    unlocked: false,
    duration: 0,
    seekPos: 0,
    playingState: AudioPlayingState.loading,
    cached: false,
  };

  audioRef = React.createRef<HTMLAudioElement>();

  narration: Howl | null = null;

  music: Howl | null = null;

  async componentDidMount() {
    await this.checkCached();

    this.narration = new Howl({
      src: NARRATION,
      loop: true,
      html5: false,
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
      html5: true,
      // volume: 0.1,
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
      const isPlaying = this.narration.playing();

      if (!isPlaying) {
        this.narration.play();
      }
    }

    if (this.music) {
      const isPlaying = this.music.playing();

      if (!isPlaying) {
        this.music.play();
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

  checkCached = async () => {
    try {
      const cache = await caches.open(CACHE);

      if (cache) {
        const cached1 = await cache.match(EMPTY_AUDIO_URL);
        const cached2 = await cache.match(BACKGROUND);
        const cached3 = await cache.match(NARRATION);

        const cached = Boolean(cached1 && cached2 && cached3);

        this.setState({ cached });
      }

      console.log("cached");
    } catch (error) {}
  };

  cacheTracks = async () => {
    try {
      const cache = await caches.open(CACHE);

      if (cache) {
        await cache.addAll([EMPTY_AUDIO_URL, BACKGROUND, NARRATION]);

        this.setState({ cached: true });
      }
    } catch (error) {}
  };

  cleanCache = async () => {
    try {
      const cache = await caches.open(CACHE);

      if (cache) {
        await cache.delete(EMPTY_AUDIO_URL);
        await cache.delete(BACKGROUND);
        await cache.delete(NARRATION);
      }

      this.setState({ cached: false });
    } catch (error) {}
  };

  render() {
    return (
      <div>
        <p>Cached: {this.state.cached.toString()}</p>

        {!this.state.cached && (
          <button onClick={this.cacheTracks}>Cache</button>
        )}

        {this.state.cached && (
          <button onClick={this.cleanCache}>Clean Cache</button>
        )}

        <p>Audio</p>

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

        <p>Length: {this.state.duration.toFixed(2)} seconds</p>

        <AudioSlider
          seek={this.seek}
          seekPos={this.state.seekPos}
          length={this.state.duration}
          playingState={this.state.playingState}
          pause={this.pause}
          play={this.play}
        />

        {/* <audio
          ref={this.audioRef}
          src={EMPTY_AUDIO_URL}
          loop={true}
          onPlaying={() => {
            this.setState({ unlocked: true });
          }}
          autoPlay={false}
        /> */}
      </div>
    );
  }
}

export default App;
