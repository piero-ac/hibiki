"use client";

import { useState, useRef, useEffect } from "react";

interface ShadowingPlayerProps {
	originalAudioUrl: string; // The N1 sentence audio from your database
}

export default function SimpleShadowingPlayer({
	originalAudioUrl,
}: ShadowingPlayerProps) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
	const [error, setError] = useState("");

	const audioRef = useRef<HTMLAudioElement>(null);
	const mediaRecorderRef = useRef<MediaRecorder | null>(null);
	const chunksRef = useRef<Blob[]>([]);
	const stopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Sync the visible audio player's volume slider with the application flow state
	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.volume = isRecording ? 0.25 : 1.0;
		}
	}, [isRecording]);

	// Clean up timers on unmount
	useEffect(() => {
		return () => {
			if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
		};
	}, []);

	// Add this effect to your player component
	useEffect(() => {
		// This cleanup function runs automatically when the user leaves the page / unmounts
		return () => {
			if (recordingUrl) {
				URL.revokeObjectURL(recordingUrl);
			}
		};
	}, [recordingUrl]); // Tracks your recording URL state

	// Button 1: Purely plays the reference audio
	function handlePlayOriginal() {
		if (audioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.play();
		}
	}

	// Button 2: Handles the synced recording + audio playback flow
	async function handleRecordShadowing() {
		setError("");
		setRecordingUrl(null);
		chunksRef.current = [];

		try {
			// Find this line in your handleRecordShadowing function:
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					// 1. Forces the browser to grab the raw hardware input signal
					echoCancellation: false,

					// 2. Stop the browser from aggressively filtering "noise" (muffles high fidelity mics)
					noiseSuppression: false,

					// 3. Prevent automatic digital volume adjustments/pumping
					autoGainControl: false,
				},
			});
			const mimeType = MediaRecorder.isTypeSupported("audio/webm")
				? "audio/webm"
				: "audio/mp4";

			const mediaRecorder = new MediaRecorder(stream, { mimeType });
			mediaRecorderRef.current = mediaRecorder;

			mediaRecorder.ondataavailable = (e) => {
				if (e.data.size > 0) chunksRef.current.push(e.data);
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: mimeType });
				setRecordingUrl(URL.createObjectURL(blob));
				setIsRecording(false);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);

			if (audioRef.current) {
				audioRef.current.currentTime = 0;
				await audioRef.current.play();
			}
		} catch (err) {
			setError("Microphone access denied.");
			console.error(err);
		}
	}

	function handleOriginalAudioEnded() {
		if (isRecording && mediaRecorderRef.current?.state === "recording") {
			stopTimeoutRef.current = setTimeout(() => {
				if (mediaRecorderRef.current?.state === "recording") {
					mediaRecorderRef.current.stop();
				}
			}, 600);
		}
	}

	return (
		<div className="p-6 max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-xl text-white space-y-4">
			{/* Visible, Locked Audio Player 
        'pointer-events-none' stops clicks, tracking, dragging, and volume changes.
        'select-none' prevents keyboard selection/focus manipulation.
      */}
			<div className="space-y-1">
				<p className="text-xs text-zinc-400 font-medium">
					Original Sentence Audio:
				</p>
				<div className="pointer-events-none select-none opacity-75">
					<audio
						ref={audioRef}
						controls
						src={originalAudioUrl}
						onEnded={handleOriginalAudioEnded}
						className="w-full"
					/>
				</div>
			</div>

			<div className="flex gap-3 pt-2">
				{/* Play Button */}
				<button
					onClick={handlePlayOriginal}
					disabled={isRecording}
					className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
				>
					Listen
				</button>

				{/* Record/Shadowing Button */}
				{!isRecording ? (
					<button
						onClick={handleRecordShadowing}
						className="flex-1 bg-red-600 hover:bg-red-700 text-sm py-3 rounded-lg font-medium transition-colors"
					>
						Record
					</button>
				) : (
					<div className="flex-1 flex items-center justify-center gap-2 bg-zinc-950 border border-red-500/20 text-xs text-red-400 font-medium rounded-lg animate-pulse">
						<span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
						Recording...
					</div>
				)}
			</div>

			{error && <p className="text-xs text-red-400 mt-2">{error}</p>}

			{/* User's Recording Playback Panel */}
			{recordingUrl && (
				<div className="pt-4 border-t border-zinc-800 space-y-2">
					<p className="text-xs text-emerald-400 font-medium">
						Your Attempt Pacing:
					</p>
					<audio controls src={recordingUrl} className="w-full" />
				</div>
			)}
		</div>
	);
}
