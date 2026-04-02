# Sort Youtube Playlist by Duration & Channel

Forked from [KohGeek/SortYoutubePlaylistByDuration](https://github.com/KohGeek/SortYoutubePlaylistByDuration) to add channel name sorting.

## Sort Modes

- **Shortest First** — sort all videos shortest to longest
- **Longest First** — sort all videos longest to shortest
- **Channel (A→Z)** — group videos alphabetically by channel
- **Channel (A→Z), Shortest First** — group by channel, then shortest first within each
- **Channel (A→Z), Longest First** — group by channel, then longest first within each

## Installation

Requires a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [ViolentMonkey](https://violentmonkey.github.io/). Install the script by opening `sortPlaylist.user.js` directly in your browser.

## Issues

### TamperMonkey 5.1.0, Chrome Canary 124

Something about TM and Chrome Canary is not compatible and may cause issues. Three solutions:
1. Go to TM settings, change from Novice to Advanced, scroll down to Experimental and **switch Inject mode to Instant**
2. Go to [Chrome Experiments](chrome://flags/), enable `Enable (deprecated) synchronous mutation events` and restart Chrome.
3. Reinstall Chrome completely, removing previous browsing data

## Credits

Forked from [KohGeek/SortYoutubePlaylistByDuration](https://github.com/KohGeek/SortYoutubePlaylistByDuration). Channel sorting added by [burythevalley](https://github.com/burythevalley).
