const POSITION = {
    position_exclusive_drop: {
        x: -5.517045974731445,
        y: 8.755789756774902,
        z: -18.484386444091797,
    },
    position_insider_access: {
        x: 17.585521697998047,
        y: 16.82581329345703,
        z: 0.3424501419067383,
    },
    position_community: {
        x: -8.412095069885254,
        y: 8.685957908630371,
        z: 13.441515922546387,
    },
    position_signup: {
        x: 14.011348724365234,
        y: 8.784942626953125,
        z: -12.50265884399414,
    }
}

const HTML_CONTENT = {
    menuSVG: `
        <svg fill="#ffffff" height="30px" width="30px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 297 297" xml:space="preserve" stroke="#ffffff">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <g>
                    <g>
                        <g>
                            <path
                                d="M280.214,39.211H16.786C7.531,39.211,0,46.742,0,55.997v24.335c0,9.256,7.531,16.787,16.786,16.787h263.428 c9.255,0,16.786-7.531,16.786-16.787V55.997C297,46.742,289.469,39.211,280.214,39.211z">
                            </path>
                            <path
                                d="M280.214,119.546H16.786C7.531,119.546,0,127.077,0,136.332v24.336c0,9.255,7.531,16.786,16.786,16.786h263.428 c9.255,0,16.786-7.531,16.786-16.786v-24.336C297,127.077,289.469,119.546,280.214,119.546z">
                            </path>
                            <path
                                d="M280.214,199.881H16.786C7.531,199.881,0,207.411,0,216.668v24.335c0,9.255,7.531,16.786,16.786,16.786h263.428 c9.255,0,16.786-7.531,16.786-16.786v-24.335C297,207.411,289.469,199.881,280.214,199.881z">
                            </path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    `,
    timesSVG: `
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
            <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
                <path d="M16 8L8 16M8 8L16 16" stroke="#ffffff" stroke-width="2" stroke-linecap="round"></path>
            </g>
        </svg>
    `,
}

const LOADING_TEXT = [
    "Initializing DSTRKT World...",
    "Loading the New Dimension of Streetwear...",
    "Running script...",
    "Establishing Mainframe...",
    "Loading components...",
    "System Live...",
    "Welcome to DSTRKT - The New Age Streetwear Marketplace...",
    "Get exclusive access and discover brands from around the world...",
    "Ready to enter...",
]

const OUTLINE_OBJECTS = [
    "billboard_exclusivedrops",
    "billboard_insideraccess",
    "billboard_signup",
    "billboard_communityvibes",
]

const SPOT_LIGHTS = [
    {
        params: [0xc9f24f, 15, 80, Math.PI / 2, 1, 2],
        position: [0, 4, -15],
        target_pos: [0, 0, -15]
    },
    {
        params: [0xdddddd, 20, 100, Math.PI / 2, 1, 2],
        position: [-13, 4, -7],
        target_pos: [-13, 0, -7]
    },
    {
        params: [0xdddddd, 20, 100, Math.PI / 2, 1, 2],
        position: [14, 4, 7],
        target_pos: [14, 0, 7]
    },
    {
        params: [0xffffff, 5, 30, Math.PI / 3, 1, 1],
        position: [-10, 4, -18],
        target_pos: [-10, 0, -18]
    }
]


export {
    POSITION,
    HTML_CONTENT,
    LOADING_TEXT,
    OUTLINE_OBJECTS,
    SPOT_LIGHTS,
};
