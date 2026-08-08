// Possible — The world inside Codex
// 20 cycles × 2.2 seconds = 44 seconds at 109.0909 BPM in 4/4.
// Each arranged section follows one visual beat of the film.

setcpm(109.0909 / 4)

const introMotif = note("d4 ~ a4 [c5 a4]")
  .s("triangle")
  .attack(0.01).decay(0.18).sustain(0).release(0.65)
  .lpf(2400).gain(0.28)

const worldMotif = note("d4 a4 [c5 d5] f5 a4 [g4 c5]")
  .s("triangle")
  .attack(0.008).decay(0.14).sustain(0).release(0.42)
  .lpf(3600).gain(0.25)

const gapMotif = note("d4 ~ ~ a4")
  .s("sine")
  .attack(0.03).decay(0.3).sustain(0).release(0.9)
  .lpf(1800).gain(0.24)

const possibleMotif = note("d4 f4 a4 c5 [d5 c5] a4 f4 a4")
  .s("triangle")
  .attack(0.008).decay(0.13).sustain(0).release(0.38)
  .lpf(4200).gain(0.27)

const packMotif = note("f4 a4 c5 d5 [f5 e5] d5 c5 a4")
  .s("triangle")
  .attack(0.006).decay(0.12).sustain(0).release(0.35)
  .lpf(4600).gain(0.28)

const ctaMotif = note("d5 a4 f4 d4")
  .s("sine")
  .attack(0.02).decay(0.35).sustain(0.1).release(1.25)
  .lpf(2600).gain(0.25)

const introPad = note("d3,a3")
  .s("sine")
  .attack(0.7).decay(0.4).sustain(0.45).release(1.1)
  .lpf(900).gain(0.12)

const worldPad = note("<d3,a3 bb2,f3 f3,c4 c3,g3>")
  .s("sawtooth")
  .attack(0.35).decay(0.3).sustain(0.35).release(0.8)
  .lpf(720).lpq(0.7).gain(0.085)

const gapPad = note("d3,a3")
  .s("sine")
  .attack(0.5).decay(0.3).sustain(0.3).release(1.1)
  .lpf(650).gain(0.09)

const possiblePad = note("<d3,a3 f3,c4 bb2,f3 c3,g3>")
  .s("sawtooth")
  .attack(0.25).decay(0.25).sustain(0.34).release(0.75)
  .lpf(860).lpq(0.6).gain(0.095)

const packPad = note("<f3,c4 c3,g3 d3,a3 bb2,f3>")
  .s("sawtooth")
  .attack(0.22).decay(0.24).sustain(0.36).release(0.72)
  .lpf(980).lpq(0.55).gain(0.1)

const ctaPad = note("d3,a3,d4")
  .s("sine")
  .attack(0.3).decay(0.4).sustain(0.5).release(1.6)
  .lpf(1000).gain(0.13)

const bassPulse = note("d2 ~ d2 ~")
  .s("sine")
  .attack(0.008).decay(0.18).sustain(0).release(0.22)
  .lpf(360).gain(0.3)

const bassMove = note("d2 d2 bb1 c2")
  .s("sine")
  .attack(0.008).decay(0.16).sustain(0).release(0.2)
  .lpf(420).gain(0.32)

const softKick = note("d1 ~ ~ ~")
  .s("sine")
  .attack(0.002).decay(0.16).sustain(0).release(0.08)
  .penv(26).pdecay(0.09).pcurve(1)
  .lpf(240).gain(0.32)

const activeKick = note("d1 ~ d1 ~")
  .s("sine")
  .attack(0.002).decay(0.15).sustain(0).release(0.08)
  .penv(28).pdecay(0.08).pcurve(1)
  .lpf(260).gain(0.34)

const tick = note("~ c7 ~ c7")
  .s("sine")
  .attack(0.001).decay(0.022).sustain(0).release(0.015)
  .hpf(5200).lpf(9200).gain(0.055).pan("<0.38 0.62>")

stack(
  arrange(
    [3, introMotif],
    [4, worldMotif],
    [3, gapMotif],
    [4, possibleMotif],
    [4, packMotif],
    [2, ctaMotif]
  ),
  arrange(
    [3, introPad],
    [4, worldPad],
    [3, gapPad],
    [4, possiblePad],
    [4, packPad],
    [2, ctaPad]
  ),
  arrange(
    [3, silence],
    [4, bassPulse],
    [3, silence],
    [4, bassMove],
    [4, bassMove],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, softKick],
    [3, silence],
    [4, activeKick],
    [4, activeKick],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, tick],
    [3, silence],
    [4, tick],
    [4, tick],
    [2, silence]
  )
)
