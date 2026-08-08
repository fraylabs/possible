// Direction 01 — Editorial pulse
// Precise, warm, and restrained. The score behaves like tasteful kinetic type:
// sparse marks become an organized rhythm, then clear for the final invitation.

setcpm(109.0909 / 4)
const reviewLevel = 0.48

const loneMark = note("d4 ~ a4 ~")
  .s("sine")
  .fm(1.8).fmh(2)
  .fmatt(0.004).fmdec(0.16).fmsus(0)
  .attack(0.004).decay(0.2).sustain(0).release(0.22)
  .hpf(260).lpf(3400).gain(0.19 * reviewLevel)

const expandingMarks = note("d4 [~ a4] e5 [f#5 ~]")
  .s("sine")
  .fm(2.1).fmh(2)
  .fmatt(0.004).fmdec(0.13).fmsus(0)
  .attack(0.003).decay(0.16).sustain(0).release(0.18)
  .hpf(300).lpf(4200).gain(0.16 * reviewLevel)
  .pan("0.42 0.58 0.48 0.62")

const heldQuestion = note("d4 ~ ~ a4")
  .s("triangle")
  .attack(0.025).decay(0.38).sustain(0).release(0.75)
  .hpf(220).lpf(1900).gain(0.17 * reviewLevel)

const organizedMarks = note("d4 [a4 ~] e5 [~ f#5] a4 [e5 d5]")
  .s("sine")
  .fm(2.2).fmh(2)
  .fmatt(0.003).fmdec(0.12).fmsus(0)
  .attack(0.003).decay(0.14).sustain(0).release(0.16)
  .hpf(320).lpf(4600).gain(0.17 * reviewLevel)
  .pan("0.38 0.56 0.46 0.64")

const payoffMarks = note("f#4 a4 [d5 e5] f#5 [e5 d5] a4 [~ e5]")
  .s("sine")
  .fm(2.4).fmh(2)
  .fmatt(0.003).fmdec(0.14).fmsus(0)
  .attack(0.003).decay(0.17).sustain(0).release(0.2)
  .hpf(340).lpf(5000).gain(0.18 * reviewLevel)
  .pan("0.4 0.6 0.48 0.64")

const finalSignature = note("d5 a4 e5 d5")
  .s("triangle")
  .attack(0.01).decay(0.34).sustain(0.04).release(0.85)
  .hpf(260).lpf(2800).gain(0.2 * reviewLevel)

const paperBed = note("<d3,a3 b2,f#3 g2,d3 a2,e3>")
  .s("triangle")
  .attack(0.22).decay(0.34).sustain(0.3).release(0.7)
  .hpf(150).lpf(920).gain(0.055 * reviewLevel)

const lowPulse = note("d2 ~ d2 [~ a1]")
  .s("triangle")
  .attack(0.004).decay(0.18).sustain(0).release(0.16)
  .lpf(430).gain(0.105 * reviewLevel).pan(0.5)

const warmImpact = note("d2 ~ ~ ~")
  .s("sine")
  .attack(0.002).decay(0.2).sustain(0).release(0.12)
  .penv(18).pdecay(0.08).pcurve(1)
  .lpf(280).gain(0.12 * reviewLevel).pan(0.5)

stack(
  arrange(
    [3, loneMark],
    [4, expandingMarks],
    [3, heldQuestion],
    [4, organizedMarks],
    [4, payoffMarks],
    [2, finalSignature]
  ),
  arrange(
    [3, silence],
    [4, paperBed.gain(0.75)],
    [3, silence],
    [4, paperBed],
    [4, paperBed.gain(1.08)],
    [2, note("d3,a3,e4").s("triangle").attack(0.18).sustain(0.32).release(1.2).hpf(140).lpf(1000).gain(0.09 * reviewLevel)]
  ),
  arrange(
    [3, silence],
    [4, lowPulse.gain(0.8)],
    [3, silence],
    [4, lowPulse],
    [4, lowPulse.gain(1.08)],
    [2, silence]
  ),
  arrange(
    [3, silence],
    [4, warmImpact.gain(0.7)],
    [3, silence],
    [4, warmImpact],
    [4, warmImpact.gain(1.05)],
    [2, silence]
  )
)
