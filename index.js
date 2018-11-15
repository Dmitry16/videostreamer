const { createServer } = require('http')
const { stat, createReadStream, createWriteStream } = require('fs')
const { promisify } = require('util')
const multiparty = require('multiparty')
const fileInfo = promisify(stat)
let file

const respondWithVideo = async (req, res, file) => {

    if (file) { 
        const { size } = await fileInfo(`./uploads/${file}`) 
        const range = req.headers.range
        if (range) {
            let [start, end] = range.replace(/bytes=/, '').split('-')
            start = parseInt(start, 10)
            end = end ? parseInt(end, 10) : size - 1
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': (end - start) + 1,
                'Content-Type': 'video/mp4'
            })
            createReadStream(`./video/${file}`, { start, end }).pipe(res)
        } else {
            res.writeHead(200, {
                'Content-Length': size,
                'Content-Type': 'video/mp4'
            })
            createReadStream(`./uploads/${file}`).pipe(res)
        }
    }
}

createServer((req, res) => {
    if (req.method === 'POST') {
        const form = new multiparty.Form()
        form.parse(req)
        form.on('part', (part) => {
            part.pipe(createWriteStream(`./uploads/${part.filename}`))
            .on('close', () => {
                file = part.filename
                res.writeHead(200, { 'Content-Type': 'text/html' })
                res.end(`
                    <h1>File uploaded ${part.filename}</h1>
                    <button>Play</button>
                `)
            })
        })
    } 
    else if (req.url === '/video') {
        respondWithVideo(req, res, file)
    } 
    else {
        res.writeHead(200, { 'Content-Type': 'text/html'})
        res.end(`
            <form enctype="multipart/form-data" method="POST" action="/">
                <input type="file" name="upload-file" />
                <button>Upload File</button>
            </form>
        `)
    }

}).listen(3001, () => { console.log('Server running on port 3001')})