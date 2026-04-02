/* jshint esversion: 8 */
// ==UserScript==
// @name              Sort Youtube Playlist by Duration & Channel
// @namespace         https://github.com/burythevalley/SortYoutubePlaylistByDuration
// @version           3.5.0
// @description       Sorts YouTube playlists by duration and/or channel name
// @author            burythevalley
// @license           GPL-2.0-only
// @match             http://*.youtube.com/*
// @match             https://*.youtube.com/*
// @supportURL        https://github.com/burythevalley/SortYoutubePlaylistByDuration/issues
// @grant             none
// @run-at            document-start
// ==/UserScript==

/**
 * Wait for a DOM element matching a CSS selector to appear, then fire a callback.
 * @param {string} selector - CSS selector to watch for
 * @param {function} callback - Called with the matched element
 */
let onElementReady = (selector, callback) => {
    const existing = document.querySelector(selector);
    if (existing) { callback(existing); return; }

    const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
            observer.disconnect();
            callback(element);
        }
    });

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
};

/**
 * Variables and constants
 */
const css =
    `
        .sort-playlist-div {
            font-family: "Roboto", "Arial", sans-serif;
            font-size: 1.4rem;
            padding: 4px 0;
        }
        .sort-button-wl {
            font-family: inherit;
            font-size: 1.4rem;
            font-weight: 500;
            line-height: 2rem;
            height: 32px;
            padding: 0 12px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            color: var(--yt-spec-text-primary, #fff);
            background-color: var(--yt-spec-button-chip-background-hover, #3d3d3d);
            margin-right: 8px;
        }
        .sort-button-wl:hover {
            opacity: 0.85;
        }
        .sort-button-wl:active {
            opacity: 0.7;
        }
        .sort-button-wl-stop {
            background-color: #cc0000;
            color: #fff;
        }
        .sort-button-wl-stop:hover {
            background-color: #aa0000;
        }
        .sort-select {
            font-family: "Roboto", "Arial", sans-serif;
            font-size: 1.4rem;
            font-weight: 500;
            height: 32px;
            padding: 0 8px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            color: var(--yt-spec-text-primary, #fff);
            background-color: var(--yt-spec-button-chip-background-hover, #3d3d3d);
            margin-bottom: 6px;
            display: block;
            appearance: auto;
        }
        .sort-log {
            font-family: "Roboto", "Arial", sans-serif;
            font-size: 1.2rem;
            padding: 6px 10px;
            margin-top: 6px;
            border-radius: 8px;
            background-color: var(--yt-spec-button-chip-background-hover, #202020);
            color: var(--yt-spec-text-primary, #e0e0e0);
        }
    `

const modeAvailable = [
    { value: 'channel-desc', label: 'Channel (A→Z), Longest First' },
    { value: 'channel-asc', label: 'Channel (A→Z), Shortest First' },
    { value: 'desc', label: 'Longest First' },
    { value: 'asc', label: 'Shortest First' },
];

const debug = false;

var scrollLoopTime = 600;

const validModes = modeAvailable.map(m => m.value);
const savedMode = localStorage.getItem('sortPlaylistMode');
let sortMode = validModes.includes(savedMode) ? savedMode : 'channel-desc';

let log = document.createElement('div');

let stopSort = false;
let lastTotalRuntime = 0;

/**
 * Format seconds into a human-readable duration string (e.g. "2h 15m 30s")
 * @param {number} totalSeconds
 * @return {string}
 */
let formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    let parts = [];
    if (hours > 0) parts.push(hours + 'h');
    if (minutes > 0) parts.push(minutes + 'm');
    if (seconds > 0 || parts.length === 0) parts.push(seconds + 's');
    return parts.join(' ');
};

/**
 * Fire a mouse event on an element
 * @param {string=} type
 * @param {Element} elem
 * @param {number} centerX
 * @param {number} centerY
 */
let fireMouseEvent = (type, elem, centerX, centerY) => {
    const event = new MouseEvent(type, {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY
    });

    elem.dispatchEvent(event);
};

/**
 * Simulate drag and drop
 * @see: https://ghostinspector.com/blog/simulate-drag-and-drop-javascript-casperjs/
 * @param {Element} elemDrag - Element to drag
 * @param {Element} elemDrop - Element to drop
 */
let simulateDrag = (elemDrag, elemDrop) => {
    // calculate positions
    let pos = elemDrag.getBoundingClientRect();
    let center1X = Math.floor((pos.left + pos.right) / 2);
    let center1Y = Math.floor((pos.top + pos.bottom) / 2);
    pos = elemDrop.getBoundingClientRect();
    let center2X = Math.floor((pos.left + pos.right) / 2);
    let center2Y = Math.floor((pos.top + pos.bottom) / 2);

    // mouse over dragged element and mousedown
    fireMouseEvent("mousemove", elemDrag, center1X, center1Y);
    fireMouseEvent("mouseenter", elemDrag, center1X, center1Y);
    fireMouseEvent("mouseover", elemDrag, center1X, center1Y);
    fireMouseEvent("mousedown", elemDrag, center1X, center1Y);

    // start dragging process over to drop target
    fireMouseEvent("dragstart", elemDrag, center1X, center1Y);
    fireMouseEvent("drag", elemDrag, center1X, center1Y);
    fireMouseEvent("mousemove", elemDrag, center1X, center1Y);
    fireMouseEvent("drag", elemDrag, center2X, center2Y);
    fireMouseEvent("mousemove", elemDrop, center2X, center2Y);

    // trigger dragging process on top of drop target
    fireMouseEvent("mouseenter", elemDrop, center2X, center2Y);
    fireMouseEvent("dragenter", elemDrop, center2X, center2Y);
    fireMouseEvent("mouseover", elemDrop, center2X, center2Y);
    fireMouseEvent("dragover", elemDrop, center2X, center2Y);

    // release dragged element on top of drop target
    fireMouseEvent("drop", elemDrop, center2X, center2Y);
    fireMouseEvent("dragend", elemDrag, center2X, center2Y);
    fireMouseEvent("mouseup", elemDrag, center2X, center2Y);
};

/**
 * Scroll automatically to the bottom of the page
 * @param {number} lastScrollLocation - Last known location for scrollTop
 */
let autoScroll = async (scrollTop = null) => {
    let element = document.scrollingElement;
    let currentScroll = element.scrollTop;
    let scrollDestination = scrollTop !== null ? scrollTop : element.scrollHeight;
    let scrollCount = 0;
    do {
        currentScroll = element.scrollTop;
        element.scrollTop = scrollDestination;
        await new Promise(r => setTimeout(r, scrollLoopTime));
        scrollCount++;
    } while (currentScroll != scrollDestination && scrollCount < 2 && stopSort === false);
};

/**
 * Log activities
 * @param {string=} message
 */
let logActivity = (message) => {
    log.innerText = message;
    if (debug) {
        console.log(message);
    }
};

/**
 * Generate menu container element
 */
let renderContainerElement = () => {
    const element = document.createElement('div')
    element.className = 'sort-playlist sort-playlist-div'
    element.style.paddingBottom = '16px'

    // Add buttonChild container
    const buttonChild = document.createElement('div')
    buttonChild.className = 'sort-playlist-div sort-playlist-button'
    element.appendChild(buttonChild)

    // Add selectChild container
    const selectChild = document.createElement('div')
    selectChild.className = 'sort-playlist-div sort-playlist-select'
    element.appendChild(selectChild)

    document.querySelector('div.thumbnail-and-metadata-wrapper').append(element)
}

/**
 * Generate button element
 * @param {function} click - OnClick handler
 * @param {string=} label - Button Label
 */
let renderButtonElement = (click = () => { }, label = '', red = false) => {
    // Create button
    const element = document.createElement('button')
    element.className = red ? 'sort-button-wl sort-button-wl-stop' : 'sort-button-wl'
    element.innerText = label
    element.onclick = click

    // Render button
    document.querySelector('.sort-playlist-button').appendChild(element)
};

/**
 * Generate select element
 * @param {number} variable - Variable to update
 * @param {Object[]} options - Options to render
 * @param {string=} label - Select Label
 */
let renderSelectElement = (variable = 0, options = [], label = '') => {
    // Create select
    const element = document.createElement('select');
    element.className = 'sort-select';
    element.onchange = (e) => {
        if (variable === 0) {
            sortMode = e.target.value;
            localStorage.setItem('sortPlaylistMode', sortMode);
        }
    };

    // Create options
    options.forEach((option) => {
        const optionElement = document.createElement('option')
        optionElement.value = option.value
        optionElement.innerText = option.label
        element.appendChild(optionElement)
    });

    // Pre-select persisted value
    if (variable === 0) element.value = sortMode;

    // Render select
    document.querySelector('.sort-playlist-select').appendChild(element);
};

/**
 * Generate number element
 * @param {number} variable
 * @param {number} defaultValue
 */
let renderNumberElement = (defaultValue = 0, label = '') => {
    // Create div
    const elementDiv = document.createElement('div');
    elementDiv.className = 'sort-playlist-div';
    elementDiv.innerText = label;

    // Create input
    const element = document.createElement('input');
    element.type = 'number';
    element.value = defaultValue;
    element.className = 'sort-select';
    element.style.width = '80px';
    element.oninput = (e) => { scrollLoopTime = +(e.target.value) };

    // Render input
    elementDiv.appendChild(element);
    document.querySelector('div.sort-playlist').appendChild(elementDiv);
};

/**
 * Generate log element
 */
let renderLogElement = () => {
    // Populate div
    log.className = 'sort-log';
    log.innerText = 'Logging...';

    // Render input
    document.querySelector('div.sort-playlist').appendChild(log);
};

/**
 * Add CSS styling
 */
let addCssStyle = () => {
    const element = document.createElement('style');
    element.textContent = css;
    document.head.appendChild(element);
};

/**
 * Sort videos by time
 * @param {Element[]} allAnchors - Array of anchors
 * @param {Element[]} allDragPoints - Array of draggable elements
 * @param {number} expectedCount - Expected length for video list
 * @return {number} sorted - Number of videos sorted
 */
let sortVideos = (allAnchors, allDragPoints, expectedCount) => {
    let videos = [];
    let sorted = 0;
    let dragged = false;

    // Sometimes after dragging, the page is not fully loaded yet
    // This can be seen by the number of anchors not being a multiple of 100
    if (allDragPoints.length !== expectedCount || allAnchors.length !== expectedCount) {
        logActivity("Playlist is not fully loaded, waiting...");
        return 0;
    }

    for (let j = 0; j < allDragPoints.length; j++) {
        let thumb = allAnchors[j];
        let drag = allDragPoints[j];

        let timeSpan = thumb.querySelector("#text");
        let timeDigits = timeSpan.innerText.trim().split(":").reverse();
        let time;
        if (timeDigits.length == 1) {
            (sortMode === "asc" || sortMode === "channel-asc") ? time = 999999999999999999 : time = -1;
        } else {
            time = parseInt(timeDigits[0]);
            if (timeDigits[1]) time += parseInt(timeDigits[1]) * 60;
            if (timeDigits[2]) time += parseInt(timeDigits[2]) * 3600;
        }
        let channel = thumb.closest("ytd-playlist-video-renderer")?.querySelector("#channel-name a")?.innerText?.trim() || '';
        videos.push({ anchor: drag, time: time, channel: channel, originalIndex: j });
    }

    // Calculate total runtime, excluding non-timestamped sentinel values
    lastTotalRuntime = videos.reduce((sum, v) => {
        return (v.time > 0 && v.time < 999999999999999999) ? sum + v.time : sum;
    }, 0);

    if (sortMode === 'asc') {
        videos.sort((a, b) => a.time - b.time);
    } else if (sortMode === 'desc') {
        videos.sort((a, b) => b.time - a.time);
    } else if (sortMode === 'channel-asc' || sortMode === 'channel-desc') {
        const channelCount = {};
        videos.forEach(v => { channelCount[v.channel] = (channelCount[v.channel] || 0) + 1; });

        const multi = videos.filter(v => channelCount[v.channel] > 1);
        const singles = videos.filter(v => channelCount[v.channel] === 1);

        if (sortMode === 'channel-asc') {
            multi.sort((a, b) => a.channel.localeCompare(b.channel) || a.time - b.time);
            singles.sort((a, b) => a.time - b.time);
        } else {
            multi.sort((a, b) => a.channel.localeCompare(b.channel) || b.time - a.time);
            singles.sort((a, b) => b.time - a.time);
        }

        videos = [...multi, ...singles];
    }

    for (let j = 0; j < videos.length; j++) {
        let originalIndex = videos[j].originalIndex;

        if (debug) {
            console.log("Loaded: " + videos.length + ". Current: " + j + ". Original: " + originalIndex + ".");
        }

        if (originalIndex !== j) {
            let elemDrag = videos[j].anchor;
            let elemDrop = videos.find((v) => v.originalIndex === j).anchor;

            logActivity("Sorting " + (j + 1) + "/" + videos.length + "...");
            simulateDrag(elemDrag, elemDrop);
            dragged = true;
        }

        sorted = j;

        if (stopSort || dragged) {
            break;
        }
    }

    return sorted;
}

/**
 * There is an inherent limit in how fast you can sort the videos, due to Youtube refreshing
 * This limit also applies if you do it manually
 * It is also much worse if you have a lot of videos, for every 100 videos, it's about an extra 2-4 seconds, maybe longer
 */
let activateSort = async () => {
    let reportedVideoCount = Number(document.querySelector(".metadata-stats span.yt-formatted-string:first-of-type").innerText);
    let allDragPoints = document.querySelectorAll("ytd-item-section-renderer:first-of-type yt-icon#reorder");
    let allAnchors;

    let sortedCount = 0;
    let initialVideoCount = allDragPoints.length;
    let scrollRetryCount = 0;
    stopSort = false;

    while (reportedVideoCount !== initialVideoCount
        && document.URL.includes("playlist?list=")
        && stopSort === false) {
        logActivity("Loading all videos... " + allDragPoints.length + "/" + reportedVideoCount);
        if (scrollRetryCount > 5) {
            break;
        } else if (scrollRetryCount > 0) {
            logActivity(log.innerText + "\nReported video count does not match actual video count.\nPlease make sure you remove all unavailable videos.\nAttempt: " + scrollRetryCount + "/5")
        }

        if (allDragPoints.length > 600) {
            logActivity(log.innerText + "\nSorting may take extremely long time/is likely to bug out");
        } else if (allDragPoints.length > 300) {
            logActivity(log.innerText + "\nNumber of videos loaded is high, sorting may take a long time");
        }

        await autoScroll();

        allDragPoints = document.querySelectorAll("ytd-item-section-renderer:first-of-type yt-icon#reorder");
        initialVideoCount = allDragPoints.length;

        if (((reportedVideoCount - initialVideoCount) / 10) < 1) {
            // Here, we already waited for the scrolling so things should already be loaded.
            // However, due to either unavailable video, or other discrepancy, the count do not match.
            // We increment until it's time to break the loop.
            scrollRetryCount++;
        }
    }

    logActivity(initialVideoCount + " videos loaded.");
    if (scrollRetryCount > 5) logActivity(log.innerText + "\nScroll attempt exhausted. Proceeding with sort despite video count mismatch.");
    let loadedLocation = document.scrollingElement.scrollTop;
    scrollRetryCount = 0;

    while (sortedCount < initialVideoCount && stopSort === false) {
        allDragPoints = document.querySelectorAll("ytd-item-section-renderer:first-of-type yt-icon#reorder");
        allAnchors = document.querySelectorAll("ytd-item-section-renderer:first-of-type div#content a#thumbnail.inline-block.ytd-thumbnail");
        scrollRetryCount = 0;

        while (!allAnchors[initialVideoCount - 1].querySelector("#text") && stopSort === false) {
            if (document.scrollingElement.scrollTop < loadedLocation && scrollRetryCount < 3) {
                logActivity("Video " + initialVideoCount + " is not loaded yet, attempting to scroll.");
                await autoScroll(loadedLocation);
                scrollRetryCount++;
            } else {
                logActivity("Video " + initialVideoCount + " is still not loaded. Brute forcing scroll.");
                await autoScroll();
            }
        }

        sortedCount = Number(sortVideos(allAnchors, allDragPoints, initialVideoCount) + 1);
        logActivity("Sorting " + sortedCount + "/" + initialVideoCount + "...");
        await new Promise(r => setTimeout(r, scrollLoopTime * 4));
    }

    if (stopSort === true) {
        logActivity("Sort cancelled.");
        stopSort = false;
    } else {
        logActivity("Sort complete. " + sortedCount + " videos sorted.\nTotal runtime: " + formatDuration(lastTotalRuntime));
    }
};

/**
 * Initialisation wrapper for all on-screen elements.
 */
let init = () => {
    onElementReady('div.thumbnail-and-metadata-wrapper', () => {
        renderContainerElement();
        addCssStyle();
        renderButtonElement(async () => { await activateSort() }, 'Sort Videos', false);
        renderButtonElement(() => { stopSort = true }, 'Stop Sort', true);
        renderSelectElement(0, modeAvailable, 'Sort Mode');
        renderNumberElement(600, 'Scroll Retry Time (ms)');
        renderLogElement();
    });
};

/**
 * Initialise script - IIFE
 */
(() => {
    init();
    navigation.addEventListener('navigate', navigateEvent => {
        const url = new URL(navigateEvent.destination.url);
        if (url.pathname.includes('playlist?')) init();
    });
})();
