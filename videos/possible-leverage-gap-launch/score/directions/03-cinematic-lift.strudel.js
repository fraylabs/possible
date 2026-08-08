// Direction 03 — Restrained cinematic lift
// Spacious and assured rather than ominous. Open major harmony widens with the
// capability field, briefly suspends for the awareness gap, then earns one clear rise.

setcpm(109.0909 / 4)
const reviewLevel = 0.43

const openingLine = note("d4 ~ a4 ~")
  .s("triangle")
  .attack(0.035).decay(0.5).sustain(0.08).release(0.9)
  .hpf(220).lpf(2200).gain(0.17 * reviewLevel)

const worldLine = note("d4 a4 [b4 d5] e5 [f#5 e5] a4 b4")
  .s("triangle")
  .attack(0.018).decay(0.38).sustain(0.06).release(0.72)
  .hpf(240).lpf(2900).gain(0.15 * reviewLevel)

const suspendedLine = note("a4 ~ ~ e5")
  .s("sine")
  .fm(0.8).fmh(2)
  .fmatt(0.02).fmdec(0.5).fmsus(0)
  .attack(0.04).decay(0.52).sustain(0.03).release(1.05)
  .hpf(220).lpf(2100).gain(0.15 * reviewLevel)

const possibleLine = note("d4 f#4 a4 b4 [d5 e5] f#5 e5 d5")
  .s("triangle")
  .attack(0.012).decay(0.34).sustain(0.07).release(0.62)
  .hpf(240).lpf(3200).gain(0.16 * reviewLevel)

const peakLine = note("f#4 a4 b4 d5 [e5 f#5] a5 [f#5 e5] d5")
  .s("sine")
  .fm(1.2).fmh(2)
  .fmatt(0.008).fmdec(0.28).fmsus(0)
  .attack(0.009).decay(0.34).sustain(0.05).release(0.65)
  .hpf(280).lpf(3600).gain(0.17 * reviewLevel)

const closingLine = note("a5 f#5 e5 d5")
  .s("triangle")
  .attack(0.018).decay(0.42).sustain(0.09).release(1.15)
  .hpf(240).lpf(2800).gain(0.18 * reviewLevel)

const openHarmony = note("<d3,a3,e4 b2,f#3,c#4 g2,d3,a3 a2,e3,b3>")
  .s("sawtooth")
  .attack(0.42).decay(0.45).sustain(0.34).release(0.95)
  .hpf(170).lpf(720).lpq(0.7).gain(0.05 * reviewLevel)

const liftedHarmony = note("<d3,a3,e4 g3,d4,a4 b2,f#3,c#4 a2,e3,b3>")
  .s("sawtooth")
  .attack(0.32).decay(0.4).sustain(0.38).release(0.9)
  .hpf(170).lpf(900).lpq(0.7).gain(0.065 * reviewLevel)

const heartPulse = note("d2 ~ ~ d2")
  .s("triangle")
  .attack(0.008).decay(0.26).sustain(0).release(0.2)
  .lpf(440).gain(0.1 * reviewLevel).pan(0.5)

const arrivalPulse = note("d2 ~ d2 ~")
  .s("sine")
  .attack(0.002).decay(0.22).sustain(0).release(0.13)
  .penv(20).pdecay(0.095).pcurve(1)
  .lpf(290).gain(0.115 * reviewLevel).pan(0.5)

const highAir = note("~ a5 ~ e6")
  .s("sine")
  .attack(0.02).decay(0.48).sustain(0).release(0.85)
  .hpf(1200).lpf(4200).gain(0.07 * reviewLevel).pan("0.4 0.6")

stack(
  arrange(
    [3, openingLine],
    [4, worldLine],
    [3, suspendedLine],
    [4, possibleLine],
    [4, peakLine],
    [2, closingLine]
  ),
  arrange(
    [3, note("d3,a3").s("triangle").attack(0.45).sustain(0.28).release(1).hpf(150).lpf(850).gain(0.055 * reviewLevel)],
    [4, openHarmony],
    [3, note("d3,a3").s("sine").attack(0.42).sustain(0.2).release(1).hpf(150).lpf(720).gain(0.05 * reviewLevel)],
    [4, liftedHarmony],
    [4, liftedHarmony.gain(1.16)],
    [2, note("d3,a3,e4").s("triangle").attack(0.35).sustain(0.38).release(1.4).hpf(150).lpf(1000).gain(0.08 * reviewLevel)]
  ),
  arrange(
    [3, silence],
    [4, heartPulse.gain(0.78)],
    [3, silence],
    [4, heartPulse],
    [4, heartPulse.gain(1.08)],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, silence],
    [3, silence],
    [4, arrivalPulse.gain(0.84)],
    [4, arrivalPulse],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, highAir.gain(0.7)],
    [3, silence],
    [4, highAir],
    [4, highAir.gain(1.12)],
    [2, silence]
  )
)
