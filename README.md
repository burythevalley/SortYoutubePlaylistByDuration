# Sort Youtube Playlist by Duration & Channel

Forked from [KohGeek/SortYoutubePlaylistByDuration](https://github.com/KohGeek/SortYoutubePlaylistByDuration) to add channel name sorting.

## Sort Modes

- **Channel (A→Z), Longest First** — group by channel alphabetically, longest first within each group
- **Channel (A→Z), Shortest First** — group by channel alphabetically, shortest first within each group
- **Longest First** — sort all videos longest to shortest
- **Shortest First** — sort all videos shortest to longest

### Channel mode behaviour

Channels with only one video in the playlist are treated as "one-offs" and placed at the end, sorted by duration rather than grouped alphabetically.

| Mode | Multi-video channels | Single-video channels |
|---|---|---|
| Channel (A→Z), Longest First | Grouped A→Z, longest first | Longest first, at the end |
| Channel (A→Z), Shortest First | Grouped A→Z, shortest first | Shortest first, at the end |

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
