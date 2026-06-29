"use client";

import { useState, useRef, useEffect } from "react";
import { checkPronunciation } from "@/app/protected/sentences/actions";
import { Button } from "@/components/ui/button";

interface ShadowingPlayerProps {
	originalAudioUrl: string;
	expectedText: string;
	sentenceId: string;
}

export default function SimpleShadowingPlayer({
	originalAudioUrl,
	expectedText,
	sentenceId,
}: ShadowingPlayerProps) {
	const [isRecording, setIsRecording] = useState(false);
	const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
	const [error, setError] = useState("");
	const [rawAudioBlob, setRawAudioBlob] = useState<Blob | null>(null);
	const [isGrading, setIsGrading] = useState(false);
	const [attemptScore, setAttemptScore] = useState<number | null>(null);
	const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
	const [receivedText, setReceivedText] = useState<string | null>(null);
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
		setFeedbackMessage(null);
		setAttemptScore(null);
		setReceivedText(null);

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
			const formData = new FormData();
			formData.append("audio", rawAudioBlob, "recording.webm");

			const response = await checkPronunciation(
				formData,
				expectedText,
				sentenceId,
			);

			if (response.success) {
				setFeedbackMessage(getFeedbackMessage(response.score ?? 0));
				setAttemptScore(response.score !== undefined ? response.score : 0);
				setReceivedText(response.receivedText ?? null);
			} else {
				setError(
					response.error || "Grading engine returned a processing error.",
				);
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
		<div className="w-full max-w-2xl space-y-4">
			<audio
				ref={audioRef}
				src={originalAudioUrl}
				onEnded={handleOriginalAudioEnded}
				className="hidden"
			/>

			<div className="grid gap-3 sm:grid-cols-2">
				<Button
					onClick={handlePlayOriginal}
					disabled={isRecording || isCountingDown}
					variant="outline"
					size="lg"
					className="h-14"
				>
					Listen
				</Button>

				{isCountingDown ? (
					<Button disabled size="lg" className="h-14 animate-pulse">
						Starting in {countdown}...
					</Button>
				) : !isRecording ? (
					<Button onClick={handleRecordShadowing} size="lg" className="h-14">
						Record Shadowing
					</Button>
				) : (
					<Button disabled size="lg" className="h-14 animate-pulse">
						Recording...
					</Button>
				)}
			</div>

			{error && (
				<div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
					{error}
				</div>
			)}

			{recordingUrl && (
				<div className="space-y-4 rounded-2xl border bg-muted/40 p-4">
					<div className="space-y-2">
						<p className="text-sm font-medium">Your recording</p>
						<audio
							ref={userAudioRef}
							controls
							src={recordingUrl}
							className="w-full"
						/>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<Button
							onClick={handlePlayBothSync}
							disabled={isGrading}
							variant="outline"
						>
							Play Both
						</Button>

						{!feedbackMessage ? (
							<Button onClick={handleSubmitForGrading} disabled={isGrading}>
								{isGrading ? "Analyzing..." : "Submit Attempt"}
							</Button>
						) : (
							<Button disabled variant="secondary">
								Attempt Graded
							</Button>
						)}
					</div>

					{feedbackMessage && (
						<div className="rounded-xl border bg-background p-4">
							{attemptScore !== null && (
								<p className="text-2xl font-bold">Score: {attemptScore}%</p>
							)}

							<p className="mt-2 text-sm text-muted-foreground">
								{feedbackMessage}
							</p>

							{receivedText && (
								<p className="mt-3 text-xs leading-5 text-muted-foreground">
									Whisper heard: {receivedText}
								</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}

function getFeedbackMessage(score: number): string {
	if (score === 100) {
		return "Perfect! You said it perfectly. 🎉";
	}

	if (score >= 95) {
		return "Excellent! Nearly identical to the target sentence.";
	}

	if (score >= 85) {
		return "Great job! Just a few small differences detected.";
	}

	if (score >= 70) {
		return "Good attempt. You're close, but some words were interpreted differently.";
	}

	if (score >= 50) {
		return "Decent start. Try speaking more clearly and matching the rhythm.";
	}

	return "Keep practicing. Whisper had trouble matching your recording to the target sentence.";
}
