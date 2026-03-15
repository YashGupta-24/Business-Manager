import log from 'loglevel';

// Set logging level based on environment
// In production, we only want to see warnings and errors.
// In development, we want to see trace, debug, info, warn, error.
if (import.meta.env.MODE === 'production') {
    log.setLevel('warn');
} else {
    log.setLevel('trace');
}

export default log;
