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

## Credits

Forked from [KohGeek/SortYoutubePlaylistByDuration](https://github.com/KohGeek/SortYoutubePlaylistByDuration). Channel sorting added by [burythevalley](https://github.com/burythevalley).
