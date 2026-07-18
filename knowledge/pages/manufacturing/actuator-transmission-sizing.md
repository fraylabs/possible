---
slug: actuator-transmission-sizing
title: Actuator and transmission sizing
summary: A requirements-led method for relating robot joint loads, speed, duty cycle, motor characteristics, transmission behavior, sensing, and thermal limits before selecting hardware.
tags: [robotics, actuation, transmission, sizing, motors]
reviewedAt: 2026-07-18
sources:
  - title: "2.12 Introduction to Robotics: Chapter 2"
    url: https://ocw.mit.edu/courses/2-12-introduction-to-robotics-fall-2005/resources/chapter2/
  - title: "Optimal Actuator Design"
    url: https://biomimetics.mit.edu/research/1a9ba04b-d200-4743-b8fc-bf231f3231f0/
---

## What this makes possible

A traceable first-pass actuator and transmission requirement for each joint: output torque, speed, motion range, duty cycle, sensing, inertia, thermal behavior, and relevant failure or holding cases.

## A common approach

Start with the arm’s payload, link inertias, reach, acceleration, gravity direction, external forces, motion profile, and environment. Convert those requirements into joint torque and speed envelopes, then account for transmission ratio, efficiency, reflected inertia, backlash, compliance, bearing and shaft loads, and thermal duty. Compare continuous and peak requirements with real motor and drive data rather than stall torque alone. MIT’s robotics material treats motor, gearbox, power, and control as a coupled drive-system problem; actuator design also exposes the tradeoff between motor size, gear ratio, torque density, and force-control behavior.

Keep the result as assumptions and margins attached to the [parametric CAD master](/wiki/parametric-cad-master). Check mounting, fasteners, brakes, encoders, cable routing, and service access through [custom motor brackets](/wiki/custom-motor-brackets). Exercise the resulting inertias and limits in [MuJoCo](/wiki/mujoco), while keeping measured friction, compliance, backlash, and thermal data separate from nominal model values.

## Use this when

Use this method when a robot arm is being designed around a new actuator, gearbox, belt, harmonic drive, series-elastic element, or other joint transmission, or when a catalog actuator must be shown to meet a specific task envelope.

## Limits and alternatives

If a complete commercial joint or arm already has validated ratings and the application stays within its documented envelope, use the supplier’s integration and acceptance process. Do not infer suitability from a motor’s nominal voltage, no-load speed, or stall torque alone.

## Important decisions

Record the load cases, safety factors, continuous-versus-peak interpretation, duty cycle, allowable temperature, transmission efficiency and backlash assumptions, reflected inertia, holding or back-drive behavior, brake requirements, encoder location, power and drive limits, and the evidence required to replace each assumption with a measurement. A sizing sheet is not a verified actuator design and does not establish safe operation.

## How to verify

Check the selected motor, drive, transmission, bearings, shafts, fasteners, and power supply against the same load cases and duty cycle. Bench-test representative joints for torque, speed, temperature, sensing, backlash, and fault behavior, then update the simulation and acceptance limits with measured values. Link the resulting interfaces to [robot control and electronics](/wiki/robot-control-electronics) before fabrication or powered motion.
