"""
Tests for EchoScribe Core Algorithms
Covers:
- Anti-Hallucination & Repetition Loop Breaker
- Elastic Windowing Subtitle Splitter with Orphan Prevention
"""

import pytest
from quickstart_demo import clean_hallucination_loops, split_into_smart_cues, SUBTITLE_PROFILES


def test_clean_hallucination_loops():
    # Test repetitive phrases
    corrupted = "Hello world. Thank you for watching. Thank you for watching. Thank you for watching. Goodbye."
    cleaned = clean_hallucination_loops(corrupted)
    assert "Thank you for watching. Thank you for watching." not in cleaned
    assert "Hello world." in cleaned
    assert "Goodbye." in cleaned


def test_clean_punctuation_loops():
    # Test repetitive punctuation
    corrupted = "Wait a second...... Are you sure??? Yes!!!!"
    cleaned = clean_hallucination_loops(corrupted)
    assert "......" not in cleaned
    assert "???" not in cleaned
    assert "!!!!" not in cleaned


def test_subtitle_profiles_no_orphans():
    text = (
        "Welcome to the lecture on distributed computing and cloud speech models. "
        "Today we are discussing how autoregressive transformers process high-throughput "
        "audio streams with low latency and zero temporal drift."
    )
    for profile_key in ["short", "medium", "long"]:
        profile = SUBTITLE_PROFILES[profile_key]
        cues = split_into_smart_cues(text, start_time=0.0, end_time=15.0, profile_key=profile_key)
        assert len(cues) > 0

        # Verify time monotonicity
        for i in range(len(cues) - 1):
            assert cues[i]["end"] <= cues[i + 1]["start"] + 0.001

        # Verify no orphan lines (allowing single-word cues only for long scientific words >= 10 chars)
        min_words = profile["min_words"]
        for cue in cues:
            words = cue["text"].split()
            if len(words) < min_words:
                assert len(words) == 1 and len(words[0]) >= 10, (
                    f"Found unacceptable orphan cue with {len(words)} words: '{cue['text']}'"
                )
