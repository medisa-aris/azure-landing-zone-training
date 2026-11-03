"""Parser for the Markdown slide outlines in slides/outline/hari-N.md.

Output structure:
    Day(number, title, goal, audience, topics=[Topic(id, title, time, note, slides=[Slide])])
    Slide(id, title, fields={name: Field(text, items, code)})
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

FIELD_RE = re.compile(r"^- \*\*([^*]+?):\*\*\s*(.*)$")
TOPIC_RE = re.compile(r"^## Topik (\S+) – (.+?)(?: \((\d\d:\d\d–\d\d:\d\d)\))?$")
SLIDE_RE = re.compile(r"^#### Slide (\S+) · (.+)$")
DAY_RE = re.compile(r"^# Hari (\d) \(([^)]+)\) – (.+)$")


@dataclass
class Field:
    text: str = ""
    items: list = field(default_factory=list)      # list[str]; sub-items prefixed with "– "
    code: list = field(default_factory=list)       # list[(lang, [lines])]


@dataclass
class Slide:
    id: str
    title: str
    fields: dict = field(default_factory=dict)

    def f(self, *names) -> Field:
        """First field whose normalised name starts with any of names."""
        for key, val in self.fields.items():
            for n in names:
                if key.startswith(n):
                    return val
        return Field()

    @property
    def tipe(self) -> str:
        return self.f("tipe").text.strip()

    @property
    def waktu(self) -> str:
        return self.f("waktu").text.strip()


@dataclass
class Topic:
    id: str
    title: str
    time: str
    note: str = ""
    slides: list = field(default_factory=list)


@dataclass
class Day:
    number: int
    weekday: str
    title: str
    goal: str = ""
    audience: str = ""
    topics: list = field(default_factory=list)


def _norm(name: str) -> str:
    return name.strip().lower()


def parse(path: Path) -> Day:
    lines = path.read_text(encoding="utf-8").splitlines()
    day = None
    topic = None
    slide = None
    cur = None          # current Field
    in_code = None      # (lang, lines) while inside a fenced block

    for raw in lines:
        line = raw.rstrip("\n")

        # fenced code inside a field (indented by 2 spaces)
        stripped = line.strip()
        if in_code is not None:
            if stripped.startswith("```"):
                cur.code.append(in_code)
                in_code = None
            else:
                in_code[1].append(line[2:] if line.startswith("  ") else line)
            continue
        if cur is not None and stripped.startswith("```"):
            in_code = (stripped[3:].strip() or "text", [])
            continue

        m = DAY_RE.match(line)
        if m:
            day = Day(int(m.group(1)), m.group(2), m.group(3).strip())
            continue
        if day and line.startswith("**Tujuan hari ini:**"):
            day.goal = line.split(":**", 1)[1].strip()
            continue
        if day and line.startswith("**Audiens:**"):
            day.audience = line.split(":**", 1)[1].strip()
            continue

        m = TOPIC_RE.match(line)
        if m:
            topic = Topic(m.group(1), m.group(2).strip(), m.group(3) or "")
            day.topics.append(topic)
            slide, cur = None, None
            continue
        if topic and slide is None and line.startswith("> "):
            topic.note += line[2:].strip() + " "
            continue

        m = SLIDE_RE.match(line)
        if m:
            slide = Slide(m.group(1), m.group(2).strip())
            topic.slides.append(slide)
            cur = None
            continue

        if slide is None:
            continue

        m = FIELD_RE.match(line)
        if m:
            cur = Field(text=m.group(2).strip())
            slide.fields[_norm(m.group(1))] = cur
            continue

        if cur is None or not stripped or stripped == "---":
            continue

        # nested list items
        im = re.match(r"^(\s+)(?:-|\d+\.)\s+(.*)$", line)
        if im:
            indent = len(im.group(1))
            text = im.group(2).strip()
            if indent >= 4 and cur.items:
                cur.items.append("– " + text)
            else:
                cur.items.append(text)
        elif line.startswith("  ") and cur.items:
            cur.items[-1] += " " + stripped
        else:
            cur.text = (cur.text + " " + stripped).strip()

    return day


if __name__ == "__main__":
    import sys
    d = parse(Path(sys.argv[1]))
    print(d.number, d.title, len(d.topics))
    for t in d.topics:
        print(" ", t.id, t.title, t.time, len(t.slides))
        for s in t.slides:
            print("    ", s.id, "|", s.tipe, "|", s.title[:50], "| items", len(s.f("pointers").items), "code", len(s.f("pointers").code))
