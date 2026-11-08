#!/usr/bin/env python3
"""Make sentence timings so the text can be highlighted while the audio plays.

Usage (needs python3 + ffmpeg; Termux: pkg install python ffmpeg):
    python scripts/make-timings.py story-1

Reads  public/data/stories.json  and the story's audio file,
finds the pauses in the audio, matches them with the sentences
and writes public/data/timings.json
"""
import json, re, subprocess, sys, os

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
story_id = sys.argv[1] if len(sys.argv) > 1 else "story-1"

stories = json.load(open(os.path.join(root, "public/data/stories.json"), encoding="utf-8"))
story = stories[story_id]
audio = os.path.join(root, "public", story["audio"].lstrip("/"))
text = story["tabs"][0]["text"]

# Same sentence splitting as src/libraryapp/components/Reader.tsx
sentences = []
for para in re.split(r"\n+", text):
    for s in re.split(r"(?<=។)", para):
        if s.strip():
            sentences.append(s)

def weight(s):
    return len(re.sub(r"[\s\u200b]", "", s))

dur = float(subprocess.check_output(
    ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", audio]).decode().strip())
log = subprocess.run(
    ["ffmpeg", "-hide_banner", "-i", audio, "-af", "silencedetect=noise=-32dB:d=0.15", "-f", "null", "-"],
    capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
sil = list(zip(starts, ends[:len(starts)]))

lead = 0.0
if sil and sil[0][0] < 0.2:
    lead = sil[0][1]
    sil = sil[1:]
trail = dur
if sil and sil[-1][1] >= dur - 0.2:
    trail = sil[-1][0]
    sil = sil[:-1]

n = len(sentences)
total = sum(weight(s) for s in sentences)
cum = []
c = 0
for s in sentences[:-1]:
    c += weight(s)
    cum.append(c / total)

def align(cands, S, E):
    """choose n-1 pauses (in order) so every sentence lasts about as long
    as its length suggests (cost = squared error, relative to its length)"""
    mids = [S] + [(a + b) / 2 for a, b in cands] + [E]
    m = len(cands)
    rate = total / (E - S)          # characters per second, on average
    exp_dur = [weight(x) / rate for x in sentences]
    INF = 1e18
    # best[i][j]: first i sentences placed, sentence i ends at pause j (mids index j)
    best = [[INF] * (m + 2) for _ in range(n + 1)]
    back = [[-1] * (m + 2) for _ in range(n + 1)]
    best[0][0] = 0
    for i in range(1, n + 1):
        last = i == n
        for j in range(1, m + 2):
            if last and j != m + 1:
                continue
            if not last and j == m + 1:
                continue
            for p in range(0, j):
                if best[i - 1][p] >= INF:
                    continue
                d = mids[j] - mids[p]
                c = best[i - 1][p] + (d - exp_dur[i - 1]) ** 2 / exp_dur[i - 1]
                if c < best[i][j]:
                    best[i][j], back[i][j] = c, p
    if best[n][m + 1] >= INF:
        return INF, []
    path, j = [], m + 1
    for i in range(n, 0, -1):
        path.append(j)
        j = back[i][j]
    path = path[::-1][:-1]            # drop the final "end of audio"
    return best[n][m + 1], [cands[k - 1] for k in path]

# the first pause may be after a spoken title, so try both
options = [(lead, sil)]
if sil:
    options.append((sil[0][1], sil[1:]))
results = [(align(c, S, trail), S) for S, c in options]
(cost, chosen), S = min(results, key=lambda r: r[0][0])
if len(chosen) != n - 1:
    sys.exit("Could not match pauses to sentences")

edges = [(S, chosen[0][0] if chosen else trail)]
for i in range(1, n):
    start = chosen[i - 1][1]
    end = chosen[i][0] if i < n - 1 else trail
    edges.append((start, end))

out_path = os.path.join(root, "public/data/timings.json")
data = json.load(open(out_path)) if os.path.exists(out_path) else {}
data[story_id] = {"sentences": [[round(a, 2), round(b, 2)] for a, b in edges]}
json.dump(data, open(out_path, "w"), ensure_ascii=False, separators=(",", ":"))

for s, (a, b) in zip(sentences, edges):
    print(f"{a:7.2f} {b:7.2f}  {weight(s)/(b-a):5.1f} ch/s  {s.strip()[:30]}")
print("start offset", S, "cost", round(cost, 1))
