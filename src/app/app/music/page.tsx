"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ListMusic,
  Plus,
  Trash2,
  Music,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Song {
  youtubeId: string;
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
}

export default function MusicPage() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loadingSong, setLoadingSong] = useState(false);

  const currentSong = currentIndex >= 0 ? queue[currentIndex] : null;

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchQuery)}`);
      const json = await res.json();
      if (json.success) {
        setSearchResults(json.data);
      } else {
        toast(json.error || "ຄົ້ນຫາບໍ່ສຳເລັດ", "error");
      }
    } catch {
      toast("ບໍ່ສາມາດຄົ້ນຫາໄດ້", "error");
    } finally {
      setSearching(false);
    }
  }

  function addToQueue(song: Song) {
    setQueue((prev) => [...prev, song]);
    toast(`ເພີ່ມ "${song.title}" ໃສ່ຄິວ`, "success");
  }

  function removeFromQueue(index: number) {
    setQueue((prev) => prev.filter((_, i) => i !== index));
    if (index < currentIndex) {
      setCurrentIndex((prev) => prev - 1);
    } else if (index === currentIndex) {
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
    }
  }

  const playSong = useCallback(async (index: number) => {
    if (index < 0 || index >= queue.length) return;
    const song = queue[index];
    setCurrentIndex(index);
    setLoadingSong(true);

    try {
      const res = await fetch(`/api/music/stream?id=${song.youtubeId}`);
      const json = await res.json();
      if (json.success && audioRef.current) {
        audioRef.current.src = json.data.streamUrl;
        audioRef.current.play();
        setIsPlaying(true);
      } else {
        toast("ບໍ່ສາມາດເປີດເພງໄດ້", "error");
      }
    } catch {
      toast("ເກີດຂໍ້ຜິດພາດ", "error");
    } finally {
      setLoadingSong(false);
    }
  }, [queue, toast]);

  function togglePlay() {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (currentIndex === -1 && queue.length > 0) {
        playSong(0);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }

  function playNext() {
    if (currentIndex < queue.length - 1) {
      playSong(currentIndex + 1);
    }
  }

  function playPrev() {
    if (currentIndex > 0) {
      playSong(currentIndex - 1);
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration);
    const onEnded = () => {
      if (currentIndex < queue.length - 1) {
        playSong(currentIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
    };
  }, [currentIndex, queue.length, playSong]);

  function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }

  return (
    <div className="space-y-6">
      <audio ref={audioRef} />

      <div>
        <h1 className="text-2xl font-bold">ເພງ</h1>
        <p className="text-sm text-neutral-500">ຄົ້ນຫາ ແລະ ເປີດເພງ</p>
      </div>

      {/* Player */}
      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {currentSong?.thumbnailUrl ? (
            <img
              src={currentSong.thumbnailUrl}
              alt={currentSong.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-neutral-100">
              <Music className="h-8 w-8 text-neutral-300" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-neutral-900">
              {currentSong?.title || "ບໍ່ມີເພງ"}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-400">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary"
              />
              <span className="text-xs text-neutral-400">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={playPrev} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" disabled={currentIndex <= 0}>
              <SkipBack className="h-5 w-5" />
            </button>
            <button onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark" disabled={loadingSong}>
              {loadingSong ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            </button>
            <button onClick={playNext} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" disabled={currentIndex >= queue.length - 1}>
              <SkipForward className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setMuted(!muted)} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100">
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => { setVolume(parseInt(e.target.value)); setMuted(false); }}
              className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-neutral-200 accent-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Search */}
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-100 px-4 py-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  className="h-10 w-full rounded-md border border-neutral-200 bg-white pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="ຄົ້ນຫາເພງ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" loading={searching} size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-neutral-400">
                <Search className="mb-2 h-8 w-8" />
                <p className="text-sm">ຄົ້ນຫາເພງຈາກ YouTube</p>
              </div>
            ) : (
              searchResults.map((song) => (
                <div key={song.youtubeId} className="flex items-center gap-3 border-b border-neutral-50 px-4 py-2.5 hover:bg-neutral-50">
                  {song.thumbnailUrl && (
                    <img src={song.thumbnailUrl} alt="" className="h-10 w-14 rounded object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{song.title}</p>
                    {song.duration && <p className="text-xs text-neutral-400">{formatTime(song.duration)}</p>}
                  </div>
                  <button onClick={() => addToQueue(song)} className="rounded-md p-1.5 text-neutral-400 hover:bg-primary-light hover:text-primary">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Queue */}
        <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
            <h3 className="flex items-center gap-2 font-semibold">
              <ListMusic className="h-4 w-4 text-primary" />
              ຄິວເພງ ({queue.length})
            </h3>
            {queue.length > 0 && (
              <Button size="sm" variant="ghost" onClick={() => { setQueue([]); setCurrentIndex(-1); setIsPlaying(false); if (audioRef.current) audioRef.current.pause(); }}>
                ລ້າງຄິວ
              </Button>
            )}
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {queue.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-neutral-400">
                <ListMusic className="mb-2 h-8 w-8" />
                <p className="text-sm">ຍັງບໍ່ມີເພງໃນຄິວ</p>
              </div>
            ) : (
              queue.map((song, index) => (
                <div
                  key={`${song.youtubeId}-${index}`}
                  className={`flex items-center gap-3 border-b border-neutral-50 px-4 py-2.5 ${
                    index === currentIndex ? "bg-primary-light" : "hover:bg-neutral-50"
                  }`}
                >
                  <button
                    onClick={() => playSong(index)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-medium shadow-sm hover:bg-primary hover:text-white"
                  >
                    {index === currentIndex && isPlaying ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3 ml-0.5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`truncate text-sm ${index === currentIndex ? "font-semibold text-primary-dark" : ""}`}>
                      {song.title}
                    </p>
                  </div>
                  <button onClick={() => removeFromQueue(index)} className="rounded p-1 text-neutral-400 hover:text-danger">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
