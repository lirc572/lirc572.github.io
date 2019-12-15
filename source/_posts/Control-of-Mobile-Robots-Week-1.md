---
title: Control of Mobile Robots Week 1
tags: control-of-mobile-robots
date: 2019-12-16 00:27:32
---


<script type="text/x-mathjax-config">
MathJax.Hub.Config({
  tex2jax: {inlineMath: [['$','$'], ['\\(','\\)']]}
});
</script>
<script type="text/javascript" async
  src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML">
</script>

## What Is Control Theory

- System: something that changes over time
- Control: influence the change
- Examples:
  - *Robots*
  - Epidemics
  - Stock markets
  - Thermostats
  - Circuits
  - Engines
  - Power grids
  - Autopilots
- Basic building blocks:
  - **State (x)**: representation of what the system is currently doing
  - **Dynamics**: description of how the state changes
  - **Reference (r)**: what we want the system to do
  - **Output (y)**: measurement of (some aspects of the) system
  - **Input (u)**: control signal
  - **Feedback**: mapping from outputs to inputs

## The Need for Models

- Control Theory = how to pick the input signal u
- Objectives:
  - Stability
  - Tracking
  - Bobustness
  - Disturbance rejection
  - Optimality
- Dynamical Models
  - Effective control strategies rely on predictive models
  - Discrete time (difference equation):
    - $x_{k+1} = f(x_k, u_k)$
    - Example: Clock
      - $x_{k+1} = x_k + 1$
  - Dynamics = Change over time
    - Time is continuous: instead of "next" state, we need *derivatives* with respect to time
    - Continuous time (differential equation):
      - $\frac{dx}{dt} = f(x, u) \sim \dot{x} = f(x, u)$
      - Clock:
        - $\dot{x} = 1$
- In implementation, everything is discrete/sampled
  - Sample time $\delta t$:
    - $x_k = x(k \delta t) \Rightarrow x_{k+1} = x((k+1) \delta t) = ???$
    - $x(k \delta t + \delta t) \approx x(k \delta t) + \delta t \dot{x}(k \delta t)$ (taylor approximation)

$$
x_{k+1} = x_k + \delta t f(x_k, u_k)
$$