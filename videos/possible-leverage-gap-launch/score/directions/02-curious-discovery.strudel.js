// Direction 02 — Curious discovery
// Light, modular, and optimistic without becoming cute. A small question-and-answer
// motif discovers more space, loses the beat for the awareness gap, then recombines.

setcpm(109.0909 / 4)
const reviewLevel = 0.55

const question = note("g4 [~ a4] b4 ~")
  .s("sine")
  .fm(2.5).fmh(1.5)
  .fmatt(0.004).fmdec(0.22).fmsus(0)
  .attack(0.004).decay(0.24).sustain(0).release(0.28)
  .hpf(320).lpf(3600).gain(0.17 * reviewLevel).pan(0.38)

const answer = note("~ d5 [c#5 a4] ~")
  .s("triangle")
  .attack(0.006).decay(0.22).sustain(0).release(0.32)
  .hpf(360).lpf(3900).gain(0.15 * reviewLevel).pan(0.62)

const widerQuestion = note("g4 [a4 ~] b4 [d5 ~] e5 [~ d5]")
  .s("sine")
  .fm(2.6).fmh(1.5)
  .fmatt(0.003).fmdec(0.18).fmsus(0)
  .attack(0.003).decay(0.2).sustain(0).release(0.24)
  .hpf(340).lpf(4300).gain(0.16 * reviewLevel)
  .pan("0.32 0.68 0.42 0.58")

const gapTone = note("b4 ~ ~ ~")
  .s("sine")
  .fm(1.1).fmh(2)
  .attack(0.018).decay(0.42).sustain(0).release(0.9)
  .hpf(280).lpf(2400).gain(0.16 * reviewLevel)

const libraryMotif = note("g4 [~ b4] d5 [e5 ~] b4 [d5 a4]")
  .s("sine")
  .fm(2.7).fmh(1.5)
  .fmatt(0.003).fmdec(0.17).fmsus(0)
  .attack(0.003).decay(0.19).sustain(0).release(0.24)
  .hpf(340).lpf(4500).gain(0.17 * reviewLevel)
  .pan("0.35 0.65 0.44 0.56")

const packMotif = note("b4 d5 [e5 g5] e5 [d5 b4] a4 [~ d5]")
  .s("triangle")
  .fm(1.7).fmh(2)
  .fmatt(0.003).fmdec(0.15).fmsus(0)
  .attack(0.003).decay(0.2).sustain(0).release(0.26)
  .hpf(380).lpf(4800).gain(0.18 * reviewLevel)
  .pan("0.4 0.6 0.46 0.64")

const resolveMotif = note("g5 e5 b4 g4")
  .s("sine")
  .fm(1.4).fmh(2)
  .fmatt(0.006).fmdec(0.3).fmsus(0)
  .attack(0.008).decay(0.35).sustain(0.03).release(0.9)
  .hpf(300).lpf(3200).gain(0.19 * reviewLevel)

const buoyantBass = note("g2 ~ [d2 ~] e2 [~ b1]")
  .s("triangle")
  .attack(0.006).decay(0.2).sustain(0).release(0.18)
  .lpf(520).gain(0.11 * reviewLevel).pan(0.5)

const roundedStep = note("g2 ~ d2 ~")
  .s("sine")
  .attack(0.002).decay(0.16).sustain(0).release(0.1)
  .penv(16).pdecay(0.075).pcurve(1)
  .lpf(300).gain(0.115 * reviewLevel).pan(0.5)

const softColors = note("<g3,d4 e3,b3 c3,g3 d3,a3>")
  .s("sawtooth")
  .attack(0.18).decay(0.3).sustain(0.22).release(0.62)
  .hpf(180).lpf(760).lpq(0.8).gain(0.05 * reviewLevel)

stack(
  arrange(
    [3, stack(question, answer)],
    [4, widerQuestion],
    [3, gapTone],
    [4, libraryMotif],
    [4, packMotif],
    [2, resolveMotif]
  ),
  arrange(
    [3, silence],
    [4, buoyantBass.gain(0.82)],
    [3, silence],
    [4, buoyantBass],
    [4, buoyantBass.gain(1.08)],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, roundedStep.gain(0.7)],
    [3, silence],
    [4, roundedStep],
    [4, roundedStep.gain(1.02)],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, softColors],
    [3, silence],
    [4, softColors.gain(1.08)],
    [4, softColors.gain(1.18)],
    [2, note("g3,d4,b4").s("triangle").attack(0.2).sustain(0.3).release(1.25).hpf(170).lpf(1150).gain(0.075 * reviewLevel)]
  )
)
