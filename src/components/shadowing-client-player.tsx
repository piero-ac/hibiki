"use client";

import { useState, useRef, useEffect } from "react";
import { checkPronunciation } from "@/app/protected/sentences/actions";

interface ShadowingPlayerProps {
	originalAudioUrl: string;
	japaneseText: string;
}

export default function SimpleShadowingPlayer({
	originalAudioUrl,
	japaneseText,
}: ShadowingPlayerProps) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [rawAudioBlob, setRawAudioBlob] = useState<Blob | null>(null);
	const [isGrading, setIsGrading] = useState(false);
	const [gradingResult, setGradingResult] = useState<string | null>(null);
	const [countdown, setCountdown] = useState<number | null>(null);
	const isCountingDown = countdown !== null;

	const audioRef = useRef<HTMLAudioElement>(null);
	const userAudioRef = useRef<HTMLAudioElement>(null);
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

	async function startActualRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				audio: {
					echoCancellation: false,
					noiseSuppression: false,
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

			mediaRecorder.onstop = async () => {
				const blob = new Blob(chunksRef.current, { type: mimeType });
				setRawAudioBlob(blob);
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
			setCountdown(null);
		}
	}

	function handleRecordShadowing() {
		setError("");
		setRawAudioBlob(null);
		setGradingResult(null);

		if (recordingUrl) {
			URL.revokeObjectURL(recordingUrl);
		}

		setRecordingUrl(null);
		chunksRef.current = [];

		// Start the countdown at 3
		let currentCount = 3;
		setCountdown(currentCount);

		const interval = setInterval(() => {
			currentCount -= 1;

			if (currentCount > 0) {
				setCountdown(currentCount);
			} else {
				clearInterval(interval);
				setCountdown(null); // Remove countdown overlay/text
				startActualRecording(); // Fire up the microphone and track!
			}
		}, 1000);
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

	async function handleSubmitForGrading() {
		if (!rawAudioBlob) return;

		setIsGrading(true);
		setError("");

		try {
			// Step 1 Checkpoint: Fire the secure tunnel using a temporary dummy string
			const dummyBase64 = "placeholder_data";
			const response = await checkPronunciation(dummyBase64, japaneseText);

			if (response.success) {
				setGradingResult(response.message);
			} else {
				setError("Grading engine returned a processing error.");
			}
		} catch (err) {
			setError("Failed to communicate with grading server.");
			console.error(err);
		} finally {
			setIsGrading(false);
		}
	}

	function handlePlayBothSync() {
		if (audioRef.current && userAudioRef.current) {
			audioRef.current.currentTime = 0;
			audioRef.current.volume = 0.05;
			userAudioRef.current.currentTime = 0;

			userAudioRef.current.onended = () => {
				if (audioRef.current) audioRef.current.volume = 1.0;
			};

			audioRef.current.play();
			userAudioRef.current.play();
		}
	}

	return (
		<div className="p-6 max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded-xl text-white space-y-4">
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
				<button
					onClick={handlePlayOriginal}
					disabled={isRecording || isCountingDown}
					className="flex-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
				>
					Listen
				</button>

				{isCountingDown ? (
					<div className="flex-1 flex items-center justify-center gap-2 bg-amber-600/20 border border-amber-500 text-sm text-amber-400 font-bold rounded-lg animate-pulse">
						⏱️ Starting in {countdown}...
					</div>
				) : !isRecording ? (
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

			{recordingUrl && (
				<div className="pt-4 border-t border-zinc-800 space-y-3">
					<div>
						<p className="text-xs text-zinc-400 font-medium mb-1">
							Your Capture (Verify your pronunciation):
						</p>
						<audio
							ref={userAudioRef}
							controls
							src={recordingUrl}
							className="w-full"
						/>
					</div>

					<button
						onClick={handlePlayBothSync}
						disabled={isGrading}
						className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-sm py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
					>
						🔄 Play Both Simultaneously
					</button>

					{!gradingResult ? (
						<button
							onClick={handleSubmitForGrading}
							disabled={isGrading}
							className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-800 text-sm py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
						>
							{isGrading
								? "Analyzing Pronunciation..."
								: "🎯 Submit & Grade Attempt"}
						</button>
					) : (
						<div className="p-3 bg-zinc-950 border border-emerald-500/30 rounded-lg text-sm text-emerald-400 font-medium">
							{gradingResult}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
