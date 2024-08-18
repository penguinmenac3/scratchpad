/**
 * @type {import('vite').UserConfig}
 */
const config = {
    // ...
    base: "/scratchpad/",
    server: {
        watch: {
            ignored: ['!**/dist/'],
            usePolling: true
        }
    }
}

export default config
