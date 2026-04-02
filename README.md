# Sort Youtube Playlist by Duration & Channel

A userscript that sorts YouTube playlists by duration and/or channel name. Your preferred sort mode is remembered between sessions. Shows total playlist runtime after sorting. UI is styled to match YouTube's native design and adapts to light/dark mode automatically.

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

## Credits

Forked from [KohGeek/SortYoutubePlaylistByDuration](https://github.com/KohGeek/SortYoutubePlaylistByDuration). Channel sorting and additional features by [burythevalley](https://github.com/burythevalley).
