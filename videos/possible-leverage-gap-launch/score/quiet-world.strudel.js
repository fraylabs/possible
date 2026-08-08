// Quiet World
// A small, patient piece that happens to fit the film — not a score chasing its cuts.
// 16 cycles at 87.2727 BPM = 44 seconds.

setcpm(87.2727 / 4)

const themeA = note("d4 ~ a4 [b4 a4] ~ f#4 e4 ~")
  .slow(4)
  .s("sine")
  .fm(0.72).fmh(2)
  .fmatt(0.008).fmdec(0.7).fmsus(0.04)
  .attack(0.012).decay(0.95).sustain(0.08).release(1.35)
  .hpf(280).lpf(2600).gain(0.075)

const themeAAnswer = note("d4 ~ a4 [b4 a4] ~ f#4 e4 [~ a4]")
  .slow(4)
  .s("sine")
  .fm(0.72).fmh(2)
  .fmatt(0.008).fmdec(0.7).fmsus(0.04)
  .attack(0.012).decay(0.95).sustain(0.08).release(1.35)
  .hpf(280).lpf(2600).gain(0.078)

const themeB = note("f#4 ~ a4 b4 ~ d5 [c#5 b4] a4 ~")
  .slow(4)
  .s("sine")
  .fm(0.78).fmh(2)
  .fmatt(0.008).fmdec(0.72).fmsus(0.04)
  .attack(0.012).decay(1).sustain(0.09).release(1.4)
  .hpf(300).lpf(2800).gain(0.082)

const themeHome = note("e4 ~ f#4 a4 ~ e4 d4 ~")
  .slow(4)
  .s("sine")
  .fm(0.62).fmh(2)
  .fmatt(0.01).fmdec(0.8).fmsus(0.03)
  .attack(0.014).decay(1.05).sustain(0.1).release(1.7)
  .hpf(260).lpf(2400).gain(0.076)

const fourChords = note("<d3,a3,e4 a2,e3,b3 b2,f#3,a3 g2,d3,a3>")
  .s("sawtooth")
  .attack(0.62).decay(0.55).sustain(0.28).release(1.25)
  .hpf(190).lpf(760).lpq(0.55).gain(0.028)

const closingChords = note("<b2,f#3,a3 g2,d3,a3 d3,a3,e4 d3,a3,f#4>")
  .s("sawtooth")
  .attack(0.62).decay(0.55).sustain(0.3).release(1.45)
  .hpf(190).lpf(780).lpq(0.55).gain(0.03)

const roots = note("<d2 a1 b1 g1>")
  .s("triangle")
  .attack(0.08).decay(0.9).sustain(0.14).release(1.05)
  .lpf(520).gain(0.032).pan(0.5)

const closingRoots = note("<b1 g1 d2 d2>")
  .s("triangle")
  .attack(0.08).decay(0.95).sustain(0.15).release(1.3)
  .lpf(520).gain(0.033).pan(0.5)

const distantAnswer = note("~ a5 ~ ~ e5 ~ f#5 ~")
  .slow(4)
  .s("triangle")
  .attack(0.05).decay(0.8).sustain(0).release(1.45)
  .hpf(900).lpf(3300).gain(0.028).pan(0.58)

stack(
  arrange(
    [4, themeA],
    [4, themeAAnswer],
    [4, themeB],
    [4, themeHome]
  ),
  arrange(
    [12, fourChords],
    [4, closingChords]
  ),
  arrange(
    [12, roots],
    [4, closingRoots]
  ),
  arrange(
    [8, silence],
    [4, distantAnswer],
    [4, silence]
  )
)
