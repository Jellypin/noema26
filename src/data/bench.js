// Engineer's Bench: one real engineering problem per machine.
// kind "fact": a documented answer exists (NASA/JPL). kind "idea": open design question, no single answer.
export const bench = {
  sojourner: {
    kind: 'fact',
    q: 'Sojourner could only talk to Earth through the Pathfinder lander. If the lander goes silent, what happens to the rover?',
    options: ['It keeps sending its own signal', 'It goes silent too', 'It drives home'],
    answer: 1,
    reveal: 'Pathfinder made its last successful transmission on September 27, 1997, and the rover had no separate link to Earth. Later Mars rovers use orbiters as radio relays, so one point of failure is not the end.',
    source: 'NASA/JPL Mars Pathfinder; NASA Science',
    next: 'Not yet invented: a communications web that heals itself, so no explorer is ever cut off by one broken link.',
  },
  spirit: {
    kind: 'fact',
    q: 'Spirit’s right-front wheel stopped turning. Engineers cannot touch the rover. What would you try?',
    options: ['End the mission', 'Drive backward, dragging the dead wheel', 'Wait for a repair crew'],
    answer: 1,
    reveal: 'NASA/JPL drove Spirit backward. The dragging wheel cut a furrow that exposed silica deposits, a hint that hot water once flowed there. A failure became a tool.',
    source: 'NASA/JPL; Sky & Telescope',
    next: 'Not yet invented: machines designed so a broken part opens a new way to work, not an early ending.',
  },
  opportunity: {
    kind: 'fact',
    q: 'Dust keeps covering Opportunity’s solar panels. It was planned for 90 days and lasted almost 15 years. What helped most?',
    options: ['Engineers sent a cleaning robot', 'Wind sometimes blew the dust off', 'It switched to a battery'],
    answer: 1,
    reveal: 'NASA calls them cleaning events: gusts that cleared dust and boosted power, unplanned, over and over. In 2014 NASA reported cleaner arrays than in any Martian winter since 2005. A global dust storm in 2018 was too much.',
    source: 'NASA/JPL via The Register; NASA Science (InSight dust cleanings)',
    next: 'Not yet invented: solar surfaces that shed dust on their own. Dust costs power on Earth’s desert solar farms too.',
  },
  insight: {
    kind: 'idea',
    q: 'Dust cut InSight’s solar power by about 30%, from dust and a growing distance from the Sun. It had no wipers. What would you invent?',
    options: ['A coating that dust cannot stick to', 'Panels that shake themselves clean', 'A tiny helper that sweeps them'],
    reveal: 'No single answer. NASA says wind clearings that helped Spirit and Opportunity never came for InSight, and power ran short in December 2022. Any of your ideas would be worth testing. That is how engineering starts.',
    source: 'NASA/JPL: For InSight, Dust Cleanings Will Yield New Science; Engadget',
    next: 'Not yet invented: a lander that can keep itself alive for decades using only what its planet gives it.',
  },
  surveyor3: {
    kind: 'fact',
    q: 'Before Apollo, NASA needed to know: would the Moon’s surface hold a lander? Surveyor 3 dug trenches. What did scientists learn?',
    options: ['The surface was solid enough', 'Dust would swallow a lander', 'The ground was too hard to land'],
    answer: 0,
    reveal: 'Surveyor 3’s sampler dug four trenches and ran bearing tests. Scientists concluded the surface was solid enough to hold an Apollo lunar module. In 1969 Apollo 12 astronauts brought its camera home to study what years on the Moon had done to it.',
    source: 'NASA Technical Reports Server (SP-146); NASA Science: Surveyor 3',
    next: 'Not yet invented: materials that endure for decades and can be reused, repaired or recycled instead of left behind.',
  },
}
