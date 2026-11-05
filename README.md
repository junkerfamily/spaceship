# Explorer 1 Flight Deck

A pretend spaceship cockpit for an iPad. Arm the switches, lift the safety cover, launch, fly to orbit, dodge asteroids and land back home, with Houston radio calls the whole way.

**Play it:** https://junkerfamily.github.io/spaceship/

On the iPad, open the link in Safari, tap **Share → Add to Home Screen**, then launch it from the rocket icon to get full screen with no browser bars. Turn the iPad sideways and the volume up.

## Cockpit window (second iPad)

A second screen shows the view out of the cockpit window, live with the flight: the launch tower sliding away, clouds rushing past, the sky turning black, Earth and the Moon in orbit, asteroids, hyperdrive, re-entry flames and fireworks on landing.

1. On mission control, tap **WINDOW** at the top to see the 4-digit code.
2. On the window iPad, open https://junkerfamily.github.io/spaceship/window.html, tap **PAIR** and type the code.
3. Add it to the Home Screen too, for full screen.

The two screens talk through a tiny Cloudflare relay in `relay/` (deploy with `cf deploy` from that folder). The link works on the GitHub Pages site, not on the claude.ai copy.

## Editing

- `mission-control.html` is the source (also published as a claude.ai artifact).
- Run `./build.sh` to regenerate `index.html`, the page GitHub Pages serves.
- `window.html` is the cockpit window page (edit it directly).
- `relay/` is the Cloudflare Worker that keeps the screens in sync.
