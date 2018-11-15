const { createServer } = require('http')
const { stat, createReadStream } = require('fs')
const { promisify } = require('util')
const fileInfo = promisify(stat)
const file = './video/IMG_0687.m4v'

createServer(async (req, res) => {
    
    const { size } = await fileInfo(file)
    const range = req.headers.range
    if (range) {
        let [start, end] = range.replace(/bytes=/, '').split('-')
        start = parseInt(start, 10)
        end = end ? parseInt(end, 10) : size - 1
        // console.log('range', start, end)
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': (end - start) + 1,
            'Content-Type': 'video/mp4'
        })
        createReadStream(file, { start, end }).pipe(res)
    } else {
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'video/mp4'
        })
        createReadStream(file).pipe(res)
    }

}).listen(3001, () => { console.log('Server running on port 3001')})