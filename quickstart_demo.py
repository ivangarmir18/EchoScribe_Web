#!/usr/bin/env python3
"""
==============================================================================
EchoScribe Quickstart Algorithmic Demo
==============================================================================
This standalone script demonstrates EchoScribe's two core algorithmic breakthroughs:
1. The 4-Stage Anti-Hallucination & Repetition Loop Breaker (Whisper Guardrail)
2. The Elastic Windowing Subtitle Splitter with Orphan Prevention (CPL/CPS)

No GPU or API keys required. Runs instantly on standard Python 3.8+.
Website: https://www.echoscribe.es
Repository: https://github.com/ivangarmir18/EchoScribe
==============================================================================
"""

import re
import sys
import os
from datetime import timedelta

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ============================================================================
# 1. CORE ALGORITHM: ANTI-HALLUCINATION LOOP BREAKER
# ============================================================================

def clean_hallucination_loops(text: str) -> str:
    """
    Strips pathological Whisper repetition loops caused by non-vocal audio,
    silence, or repetitive background music.
    """
    if not text:
        return ""
    t = str(text)
    # 1. Collapse repetitive punctuation loops (e.g. "......", "???", "!!!")
    t = re.sub(r'([¡!¿?.\-~#*=])\1{2,}', r'\1', t)
    
    # 2. Collapse repetitive isolated words with punctuation (e.g., "bye. bye. bye.")
    t = re.sub(r'(?i)\b([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]{1,20})(?:[.\-…,\s]+\1\b){2,}', r'\1', t)
    
    # 3. Multi-word cyclical phrase collapse (up to 60 characters repeated)
    for _ in range(3):
        t = re.sub(r'(?i)(.{3,60}?)(?:\s*\1){2,}', r'\1', t)
        
    # 4. Collapse adjacent identical words
    t = re.sub(r'(?i)\b([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]+)(?:\s+\1\b){2,}', r'\1 \1', t)
    return re.sub(r'\s+', ' ', t).strip()


# ============================================================================
# 2. CORE ALGORITHM: ELASTIC WINDOWING SUBTITLE SPLITTER
# ============================================================================

SUBTITLE_PROFILES = {
    "short": {
        "name": "TikTok / Reels / Shorts",
        "min_chars": 15,
        "max_chars": 26,
        "max_words": 8,
        "min_words": 2,
        "elasticity": 1.30,
    },
    "medium": {
        "name": "YouTube / Video Essays",
        "min_chars": 27,
        "max_chars": 40,
        "max_words": 12,
        "min_words": 2,
        "elasticity": 1.25,
    },
    "long": {
        "name": "Cinema / Documentaries / Lectures",
        "min_chars": 40,
        "max_chars": 55,
        "max_words": 16,
        "min_words": 2,
        "elasticity": 1.25,
    },
}

def format_timestamp(seconds: float) -> str:
    """Converts seconds into standard SubRip timestamp (HH:MM:SS,mmm)."""
    td = timedelta(seconds=seconds)
    total_sec = int(td.total_seconds())
    hours = total_sec // 3600
    minutes = (total_sec % 3600) // 60
    secs = total_sec % 60
    millis = int((seconds - int(seconds)) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

def split_into_smart_cues(text: str, start_time: float, end_time: float, profile_key: str = "medium"):
    """
    Applies the EchoScribe Elastic Windowing algorithm to partition text into
    ergonomic subtitle cues without creating awkward single-word orphan lines.
    """
    profile = SUBTITLE_PROFILES.get(profile_key, SUBTITLE_PROFILES["medium"])
    max_chars = profile["max_chars"]
    max_words = profile["max_words"]
    min_words = profile["min_words"]
    elastic_limit = int(max_chars * profile["elasticity"])

    words = text.split()
    if not words:
        return []

    # Stage 1: Initial grouping respecting soft character and word limits
    groups = []
    curr_group = []
    curr_len = 0

    for w in words:
        w_len = len(w)
        space = 1 if curr_group else 0
        if curr_group and (curr_len + space + w_len > max_chars or len(curr_group) >= max_words):
            groups.append(curr_group)
            curr_group = [w]
            curr_len = w_len
        else:
            curr_group.append(w)
            curr_len += space + w_len
    if curr_group:
        groups.append(curr_group)

    # Stage 2: Backward / Forward Merge to Eliminate Orphan Lines (< min_words)
    i = len(groups) - 1
    while i >= 0:
        if len(groups[i]) < min_words and len(groups) > 1:
            merged = False
            # Try backward merge first
            if i > 0:
                candidate = groups[i - 1] + groups[i]
                cand_len = sum(len(w) for w in candidate) + len(candidate) - 1
                if cand_len <= elastic_limit and len(candidate) <= max_words + 2:
                    groups[i - 1] = candidate
                    groups.pop(i)
                    i -= 1
                    merged = True
            # If backward merge is not viable, try forward merge
            if not merged and i + 1 < len(groups):
                candidate = groups[i] + groups[i + 1]
                cand_len = sum(len(w) for w in candidate) + len(candidate) - 1
                if cand_len <= elastic_limit and len(candidate) <= max_words + 2:
                    groups[i] = candidate
                    groups.pop(i + 1)
                    merged = True
            if merged:
                continue
        i -= 1

    # Stage 3: Proportional Timestamp Distribution
    total_words = sum(len(g) for g in groups)
    total_duration = end_time - start_time
    sec_per_word = total_duration / max(1, total_words)

    cues = []
    current_time = start_time
    for idx, g in enumerate(groups, start=1):
        g_words_count = len(g)
        cue_duration = g_words_count * sec_per_word
        cue_start = current_time
        cue_end = current_time + cue_duration if idx < len(groups) else end_time
        cues.append({
            "index": idx,
            "start": cue_start,
            "end": cue_end,
            "start_fmt": format_timestamp(cue_start),
            "end_fmt": format_timestamp(cue_end),
            "text": " ".join(g)
        })
        current_time = cue_end

    return cues


# ============================================================================
# 3. INTERACTIVE CLI DEMO RUNNER
# ============================================================================

def main():
    print("=" * 78)
    print("    EchoScribe Algorithmic Engine")
    print("    Fast Whisper Ingestion & Smart SRT Formatting Engine")
    print("    Official Website: https://www.echoscribe.es")
    print("=" * 78)
    print()

    # Simulated corrupted input from raw Whisper:
    raw_whisper_hallucination = (
        "Welcome to the lecture on distributed computing and cloud speech models. "
        "Thank you for watching. Thank you for watching. Thank you for watching. "
        "Thank you for watching. Today we are discussing how autoregressive transformers "
        "process high-throughput audio streams with low latency and zero temporal drift. "
        "Subscribe to the channel. Subscribe to the channel. Subscribe to the channel."
    )

    print("[INPUT] Raw Corrupted Whisper Output (Contains repetitive hallucinations):")
    print("-" * 78)
    print(f'"{raw_whisper_hallucination}"')
    print("-" * 78)
    print()

    # Step 1: Run Anti-Hallucination Filter
    cleaned_text = clean_hallucination_loops(raw_whisper_hallucination)
    print("[OK] [STEP 1] Anti-Hallucination Guardrail Applied:")
    print("-" * 78)
    print(f'"{cleaned_text}"')
    print("-" * 78)
    print()

    # Step 2: Compare Smart Subtitle Profiles
    audio_duration = 14.5  # seconds
    print("[OK] [STEP 2] Generating Smart Subtitle Cues across Different Ergonomic Profiles:")
    print()

    for profile_key in ["short", "medium", "long"]:
        profile_info = SUBTITLE_PROFILES[profile_key]
        cues = split_into_smart_cues(cleaned_text, start_time=0.0, end_time=audio_duration, profile_key=profile_key)

        print(f"  -- Profile: {profile_info['name'].upper()} ({profile_info['min_chars']}-{profile_info['max_chars']} chars/cue) --")
        for cue in cues:
            orphan_marker = " [ORPHAN]" if len(cue["text"].split()) < profile_info["min_words"] else ""
            print(f"    [{cue['start_fmt']} --> {cue['end_fmt']}]  {cue['text']} ({len(cue['text'])} chars){orphan_marker}")
        print()

    # Step 3: Export Demo SRT
    demo_srt_filename = "demo_output_echoscribe.srt"
    medium_cues = split_into_smart_cues(cleaned_text, start_time=0.0, end_time=audio_duration, profile_key="medium")
    with open(demo_srt_filename, "w", encoding="utf-8") as f:
        for c in medium_cues:
            f.write(f"{c['index']}\n{c['start_fmt']} --> {c['end_fmt']}\n{c['text']}\n\n")

    print(f"[OK] [STEP 3] Successfully exported sample subtitle to '{demo_srt_filename}'")
    print()
    print("=" * 78)
    print(" [SUCCESS] Demo executed successfully.")
    print("    To run the full Windows desktop application or try cloud transcription,")
    print("    download EchoScribe at: https://www.echoscribe.es")
    print("=" * 78)

if __name__ == "__main__":
    main()
