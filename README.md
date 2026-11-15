# NOEMA’26: Abandoned but Not Forgotten
NASA Space Apps Challenge 2026. Walk a pixel world of NASA machines left on Mars and the Moon, read their documented stories, then solve the real engineering problem each one faced.

## Setup
Requires Node 20.19+ or 22.12+.
```
npm install
npm run dev      # development
npm run build    # production build in dist/
npm run lint
```
## What is new in this version
- **Engineer's Bench**: after each story, one real problem (Spirit's dead wheel, Opportunity's dust, InSight's power, Surveyor 3's landing ground, Sojourner's single radio link). Answers are documented NASA/JPL facts and are labelled, with sources. InSight's is an open design question.
- **Not yet invented**: each machine ends with an imagined, clearly labelled invention seed about durable, repairable, low-waste technology.
- **Keeper's card** now records problems solved and offers sustainability-minded builds.
- Repaired garbled characters (curly quotes, ×) across the text.

## Content rules
Every card is badged HISTORICAL RECORD or IMAGINED. Sources are listed per chapter. New facts have not all been checked against primary NASA pages by a human: please review `src/data/bench.js` before submission.
