# AI Revenue Recovery OS — Interactive Executive Presentation

A single-file, zero-dependency HTML prototype of an **AI corporate meeting engine**: an AI
presenter delivers the *U.S. Healthcare Payer API & RCM Automation Feasibility Report* to an
AI executive audience that listens, reacts, takes notes and interrupts with questions — and
the whole session can be recorded to video from inside the browser.

Open `index.html` in a modern browser. There is no build step, no backend, no database and no
paid or external AI API.

## What it does

| | |
|---|---|
| **12 keynote scenes** | Purpose-built animated visuals (never PDF pages) covering the problem, the transaction layer, the capability matrix, positioning, architecture, payer intelligence, denial intelligence, prior auth & appeals, the roadmap and the conclusion. |
| **AI presenter** | Parametric SVG character with visemes, blinking, gaze, gestures, breathing and speaking/listening/thinking states. |
| **AI audience** | 3 / 5 / 7 distinct executives (CFO, CTO, RCM Director, Payer & Regulatory Expert, Investor, Provider COO, Compliance Counsel) with their own personalities, question styles, wardrobes, seating depth and sparse, human-paced idle behaviour. |
| **Interruptions** | Executives raise a hand, ask a question in character, and the presenter answers — with camera cuts to the questioner and a two-shot. Frequency follows the Low / Medium / High interaction setting. |
| **Ask the Meeting** | Put your own question to the room by voice or text; the presenter answers and an executive may follow up, then the presentation resumes where it left off. |
| **Browser TTS** | `speechSynthesis` with dynamic voice loading, per-character voice assignment, language, rate, pitch and volume, sentence chunking (works around the Chrome utterance cut-off) and a silent fallback so the session never stalls. |
| **Lip sync** | Word-boundary-driven viseme scheduling (`REST / OPEN / WIDE / ROUND / SMILE`) with micro-pauses — the mouth never simply hangs open. |
| **Cinematic camera** | Wide, presenter, screen, audience, questioner, two-shot, close-up and closing framings, driven per script line. |
| **Recording** | `MediaRecorder` + a canvas compositor. **Stage only** crops the shared tab down to the presentation frame — no browser chrome, no app UI — at 720p/1080p in 16:9, 9:16 or 1:1. Countdown, live timer, pause/resume, preview player, file stats and download. |
| **Responsive** | A genuine mobile re-layout (screen → presenter → caption slot → audience carousel), not a shrunken desktop. Works down to 320px with 44px touch targets and no horizontal overflow. |
| **Accessible** | Keyboard control, ARIA labelling, a caption live region, reduced-motion support and a contrast-aware palette. |

## Keyboard

`Space` play/pause · `←` `→` scene · `F` fullscreen · `M` mute · `C` captions · `A` ask · `R` record · `Esc` close

## Recording audio

Page-generated audio (room ambience and scene cues) is always mixed in from the Web Audio
graph. Browser speech synthesis is produced by the *browser*, not by the page, so it can only
reach the file through a shared audio track: when prompted, choose **This Tab** and enable
**“Also share tab audio”**, or share the screen with system audio. If no audio track is
granted, the app says so explicitly on the result screen rather than silently producing a
video without narration.

## Architecture

Everything lives in `index.html`, organised as decoupled engines that talk over a small
pub/sub bus, so any one of them can be replaced without touching the others:

```
App
├── Store              settings + session state (persisted)
├── ScenePlan          data-driven scenes, script lines, beats, interjections
├── Cast               presenter + audience personas
├── CharacterEngine    parametric SVG humans → swappable for GLB / VRM / three.js
├── LipSyncEngine      viseme scheduling → swappable for a phoneme aligner
├── TTSEngine          speechSynthesis → swappable for a real TTS service
├── AudioBus           Web Audio ambience, cues and the recording audio graph
├── CameraEngine       cinematic camera states
├── SlideEngine        dynamic keynote visuals with auto-fit
├── AudienceEngine     idle behaviour, reactions, scripted questions
├── InteractionEngine  local Q&A resolver — set `.adapter` to plug in an LLM
├── RecordingEngine    MediaRecorder + stage compositor → swappable for server-side FFmpeg
└── UI                 shell, panels, captions, shortcuts, responsive glue
```

`InteractionEngine.adapter = async (question, ctx) => ({ answer: [...] })` is the single seam
needed to move from the local knowledge base to a real model.

## Content provenance

Every figure, capability rating and caveat comes from the source feasibility report
(43 payer organisations; CMS, ASC X12, HL7 Da Vinci, CAQH and vendor developer documentation),
including its YES / PARTIAL / NO / UNKNOWN discipline — a free sandbox is never presented as a
free production API, and clearinghouse reach is never presented as a payer API. Nothing is
invented: where the report records UNKNOWN, so does the presentation.
