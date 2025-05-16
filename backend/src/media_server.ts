const NodeMediaServer = require('node-media-server');

const config = {
    rtmp: {
        port: 1935,
        chunk_size: 60000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
    },
    http: {
        port: 8081,
        allow_origin: '*',
    },
    trans: {
        ffmpeg: '/path/to/ffmpeg',  // Replace with your ffmpeg path
        tasks: [
            {
                app: 'live',
                ac: 'aac',
                vc: 'libx264',
                rtmp: true,
                hls: true,
                dash: true,
            },
        ],
    },
};

const nms = new NodeMediaServer(config);
nms.run();
