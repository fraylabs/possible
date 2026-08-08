// Garden Window
// A complete 24-cycle piece for the full Strudel runtime.
// Calm, melodic, and spacious; the film can sit on top of it without the music chasing cuts.

setcps(16 / 44)

const themeA = note("d4 ~ a4 ~ [b4 a4] f#4 e4 ~")
  .slow(4)
  .piano()
  .velocity("0.52 0.38 0.48 0.34 0.5 0.4 0.36 0.3")
  .attack(0.015).release(1.8)
  .room(0.62).roomsize(4)
  .delay(0.12).delaytime(0.375).delayfeedback(0.22)
  .gain(0.72)

const themeAAnswer = note("d4 ~ a4 ~ [b4 d5] c#5 a4 [~ e5]")
  .slow(4)
  .piano()
  .velocity("0.5 0.36 0.46 0.34 0.54 0.42 0.38 0.32")
  .attack(0.015).release(1.9)
  .room(0.64).roomsize(4)
  .delay(0.13).delaytime(0.375).delayfeedback(0.23)
  .gain(0.74)

const themeB = note("f#4 ~ a4 b4 ~ d5 [e5 f#5] e5 ~")
  .slow(4)
  .piano()
  .velocity("0.46 0.34 0.44 0.48 0.32 0.55 0.62 0.44")
  .attack(0.015).release(2)
  .room(0.68).roomsize(4.5)
  .delay(0.14).delaytime(0.375).delayfeedback(0.24)
  .gain(0.76)

const themePeak = note("a4 ~ b4 d5 ~ f#5 [e5 d5] a4 ~")
  .slow(4)
  .piano()
  .velocity("0.48 0.34 0.46 0.54 0.34 0.66 0.48 0.4")
  .attack(0.015).release(2.1)
  .room(0.7).roomsize(5)
  .delay(0.15).delaytime(0.375).delayfeedback(0.25)
  .gain(0.78)

const themeHome = note("e5 ~ d5 a4 ~ f#4 e4 d4 ~")
  .slow(4)
  .piano()
  .velocity("0.48 0.32 0.45 0.42 0.3 0.4 0.36 0.5")
  .attack(0.015).release(2.3)
  .room(0.68).roomsize(4.5)
  .delay(0.12).delaytime(0.375).delayfeedback(0.2)
  .gain(0.72)

const finalPhrase = note("f#4 ~ e4 a4 ~ e4 d4@2")
  .slow(4)
  .piano()
  .velocity("0.4 0.3 0.36 0.44 0.3 0.34 0.56")
  .attack(0.02).release(3)
  .room(0.72).roomsize(5)
  .delay(0.1).delaytime(0.5).delayfeedback(0.18)
  .gain(0.7)

const mainChords = chord("<Dmaj9 A6 Bm7 Gmaj7>")
const mainHarmony = mainChords.voicing().anchor("D4").mode("below")

const liftedChords = chord("<Dmaj9 F#m7 Gmaj7 Asus4>")
const liftedHarmony = liftedChords.voicing().anchor("D4").mode("below")

const closingChords = chord("<Bm7 Gmaj7 Dmaj9 Dmaj9>")
const closingHarmony = closingChords.voicing().anchor("D4").mode("below")

const warmPad = mainHarmony
  .s("supersaw")
  .superimpose(x => x.detune("0.22"))
  .attack(1.25).release(2.8)
  .hpf(180).lpf(perlin.slow(5).range(720, 1700))
  .lpenv(perlin.slow(4).range(0.8, 2.2))
  .room(0.78).roomsize(6)
  .gain(0.1)

const liftedPad = liftedHarmony
  .s("supersaw")
  .superimpose(x => x.detune("0.28"))
  .attack(1.1).release(3)
  .hpf(180).lpf(perlin.slow(4).range(820, 2100))
  .lpenv(perlin.slow(3).range(1, 2.6))
  .room(0.82).roomsize(6)
  .gain(0.11)

const closingPad = closingHarmony
  .s("supersaw")
  .superimpose(x => x.detune("0.18"))
  .attack(1.3).release(3.5)
  .hpf(180).lpf(perlin.slow(6).range(680, 1500))
  .lpenv(perlin.slow(5).range(0.7, 1.8))
  .room(0.82).roomsize(6)
  .gain(0.09)

const pianoArpeggio = mainHarmony
  .n("0 2 1 3 2 1")
  .piano()
  .velocity("0.34 0.24 0.3 0.22 0.28 0.2")
  .attack(0.01).release(1.2)
  .hpf(170).lpf(4200)
  .room(0.58).roomsize(4)
  .gain(0.46)

const liftedArpeggio = liftedHarmony
  .n("0 2 1 3 2 4 3 1")
  .piano()
  .velocity("0.34 0.24 0.3 0.22 0.28 0.36 0.3 0.2")
  .attack(0.01).release(1.25)
  .hpf(170).lpf(4600)
  .room(0.62).roomsize(4.5)
  .gain(0.48)

const roots = mainChords.rootNotes(2)
  .s("supersaw")
  .attack(0.35).release(2.2)
  .lpf(420).room(0.35)
  .gain(0.055).pan(0.5)

const liftedRoots = liftedChords.rootNotes(2)
  .s("supersaw")
  .attack(0.3).release(2.4)
  .lpf(480).room(0.38)
  .gain(0.06).pan(0.5)

const closingRoots = closingChords.rootNotes(2)
  .s("supersaw")
  .attack(0.4).release(3)
  .lpf(400).room(0.4)
  .gain(0.05).pan(0.5)

const highAnswer = note("~ a5 ~ ~ e5 ~ f#5 ~")
  .slow(4)
  .piano()
  .attack(0.03).release(2.2)
  .hpf(800).lpf(5000)
  .room(0.86).roomsize(7)
  .delay(0.16).delaytime(0.5).delayfeedback(0.28)
  .gain(0.16).pan(0.58)

$: arrange(
  [4, themeA],
  [4, themeAAnswer],
  [4, themeB],
  [4, themePeak],
  [4, themeHome],
  [4, finalPhrase]
)

$: arrange(
  [8, warmPad],
  [8, liftedPad],
  [8, closingPad]
)

$: arrange(
  [4, silence],
  [4, pianoArpeggio],
  [8, liftedArpeggio],
  [4, pianoArpeggio.gain(0.8)],
  [4, silence]
)

$: arrange(
  [4, silence],
  [4, roots.gain(0.8)],
  [8, liftedRoots],
  [8, closingRoots]
)

$: arrange(
  [8, silence],
  [8, highAnswer],
  [8, silence]
)

all(x => x.postgain(0.78))
