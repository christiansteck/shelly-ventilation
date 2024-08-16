# shelly-ventilation
Shelly script for running my home ventilation system.

My house has a built-in ventilation system with three modes: off, low and high.
It is controlled by a switch similar to the ones used for roller shutters, i.e.
it is a double rocker switch where only one part can be "on" at a time.

Unfortunately it is not possible to use any of the usual smart roller shutter devices to control this system,
since they all assume that the shutter is closed after a few minutes and then simply turn off the power.
E.g. the shelly imposes a limit of 360 seconds.

By using a custom script, it is possible to circumvent these limitations and tailor the behavior exactly to my needs.

The attached script is running on a Shell Plus 2PM with the switches in **detached** mode.
