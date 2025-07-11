import React, { useState, useRef, useEffect } from 'react';

// Danh sách nhạc nền có sẵn
const BACKGROUND_MUSIC_OPTIONS = [
  {
    id: 'star_sky',
    name: 'Star Sky',
    filename: 'StarSky.mp3',
    path: '/background_music/StarSky.mp3',
    duration: '3:45',
    mood: 'Epic',
    genre: 'Orchestral'
  },
  {
    id: 'you_dont_know_me',
    name: 'You Don\'t Know Me',
    filename: 'YouDontKnowMe.mp3',
    path: '/background_music/YouDontKnowMe.mp3',
    duration: '2:30',
    mood: 'Melancholic',
    genre: 'Piano'
  },
  {
    id: 'illusionary_daytime',
    name: 'Illusionary Daytime',
    filename: 'IllusionaryDaytime.mp3',
    path: '/background_music/IllusionaryDaytime.mp3',
    duration: '4:15',
    mood: 'Peaceful',
    genre: 'Ambient'
  },
  {
    id: 'late_night_melancholy',
    name: 'Late Night Melancholy',
    filename: 'LateNightMelancholy.mp3',
    path: '/background_music/LateNightMelancholy.mp3',
    duration: '3:20',
    mood: 'Calm',
    genre: 'Lo-fi'
  },
  {
    id: 'counterclockwise',
    name: '逆時針向 (Counterclockwise)',
    filename: '逆時針向 .mp3',
    path: '/background_music/逆時針向 .mp3',
    duration: '4:30',
    mood: 'Energetic',
    genre: 'Electronic'
  },
  {
    id: 'paris',
    name: 'Paris',
    filename: 'Paris.mp3',
    path: '/background_music/Paris.mp3',
    duration: '3:10',
    mood: 'Romantic',
    genre: 'Jazz'
  }
];

const BackgroundMusicSelector = ({ 
  selectedMusic, 
  onMusicSelect, 
  volume = 0.7, 
  onVolumeChange,
  isEnabled = false,
  onToggleEnabled
}) => {
  const [playingId, setPlayingId] = useState(null);
  const [pausedId, setPausedId] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Xử lý play/pause cho từng item
  const handlePlayPause = (music) => {
    const isCurrentlyPlaying = playingId === music.id;
    const isCurrentlyPaused = pausedId === music.id;

    if (isCurrentlyPlaying) {
      // Đang play -> pause
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingId(null);
        setPausedId(music.id);
      }
    } else if (isCurrentlyPaused) {
      // Đang pause -> play
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          setPlayingId(music.id);
          setPausedId(null);
        }).catch((err) => {
          console.error('Play failed:', err);
        });
      }
    } else {
      // Chưa play -> play mới
      // Dừng audio cũ nếu có
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      
      // Tạo audio mới
      const audio = new Audio(music.path);
      audio.volume = volume;
      audioRef.current = audio;
      
      // Thêm event listeners
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });
      
      audio.addEventListener('ended', () => {
        setPlayingId(null);
        setPausedId(null);
        setCurrentTime(0);
      });
      
      audio.play().then(() => {
        setPlayingId(music.id);
        setPausedId(null);
      }).catch((err) => {
        console.error('Play failed:', err);
        setPlayingId(null);
      });
    }
  };

  // Xử lý seek (click vào progress bar)
  const handleSeek = (event, music) => {
    const isActive = playingId === music.id || pausedId === music.id;
    if (!audioRef.current || !isActive) return;
    
    const progressBar = event.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const progressBarWidth = rect.width;
    const seekTime = (clickX / progressBarWidth) * duration;
    
    // Validate seek time
    const validSeekTime = Math.max(0, Math.min(seekTime, duration));
    
    // Set currentTime của audio
    audioRef.current.currentTime = validSeekTime;
    setCurrentTime(validSeekTime);
  };

  // Xử lý chọn nhạc nền - tự động bật/tắt background music
  const handleSelectMusic = (music) => {
    if (selectedMusic?.id === music.id) {
      // Bỏ chọn nhạc
      onMusicSelect(null);
      // Tự động tắt background music
      onToggleEnabled(false);
    } else {
      // Chọn nhạc mới
      onMusicSelect(music);
      // Tự động bật background music
      onToggleEnabled(true);
    }
  };

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  return (
    <div className="bg-gray-700/50 rounded-lg p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-white font-medium">🎵 Background Music</span>
        {selectedMusic && (
          <div className="text-xs text-blue-400">
            Selected: {selectedMusic.name}
          </div>
        )}
      </div>

      {/* Music List */}
      <div className="space-y-3">
        {BACKGROUND_MUSIC_OPTIONS.map((music) => {
          const isSelected = selectedMusic?.id === music.id;
          const isPlaying = playingId === music.id;
          const isPaused = pausedId === music.id;
          const isActive = isPlaying || isPaused;
          
          return (
            <div
              key={music.id}
              className={`p-3 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-blue-600/20 border-blue-500/50'
                  : 'bg-gray-600/30 border-gray-500/30 hover:bg-gray-600/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">{music.name}</div>
                  <div className="text-xs text-gray-400 flex items-center space-x-2">
                    <span>{music.duration}</span>
                    <span>•</span>
                    <span>{music.mood}</span>
                    <span>•</span>
                    <span>{music.genre}</span>
                    {isPlaying && (
                      <>
                        <span>•</span>
                        <span className="text-green-400 flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                          Playing
                        </span>
                      </>
                    )}
                    {isPaused && (
                      <>
                        <span>•</span>
                        <span className="text-yellow-400 flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          Paused
                        </span>
                      </>
                    )}
                    {isSelected && (
                      <>
                        <span>•</span>
                        <span className="text-blue-400">Selected</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Nút play/pause */}
                  <button
                    onClick={() => handlePlayPause(music)}
                    className={`p-2 rounded text-white transition-colors ${
                      isPlaying
                        ? 'bg-red-600 hover:bg-red-700'
                        : isPaused
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    title={isPlaying ? 'Pause' : isPaused ? 'Play' : 'Play'}
                  >
                    {isPlaying ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  {/* Nút select */}
                  <button
                    onClick={() => handleSelectMusic(music)}
                    className={`p-2 rounded text-white transition-colors ${
                      isSelected
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                    title={isSelected ? 'Deselect' : 'Select'}
                  >
                    {isSelected ? (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress bar cho item đang active */}
              {isActive && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div 
                    className="w-full bg-gray-600 rounded-full h-2 cursor-pointer hover:bg-gray-700 transition-colors relative group"
                    onClick={(e) => handleSeek(e, music)}
                    title="Click to seek"
                  >
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all relative"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                      {/* Seek indicator */}
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"></div>
                    </div>
                    {/* Hover tooltip */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Click to seek
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Music Info */}
      {selectedMusic && (
        <div className="mt-4 p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-white font-medium mb-1">
            Selected: {selectedMusic.name}
          </div>
          <div className="text-xs text-gray-300">
            Duration: {selectedMusic.duration} • Mood: {selectedMusic.mood} • Genre: {selectedMusic.genre}
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundMusicSelector; 