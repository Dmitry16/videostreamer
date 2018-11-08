const { createServer } = require('http')
const { stat, createReadStream } = require('fs')
const { promisify } = require('util')
const fileInfo = promisify(stat)
const file1 = './data/IMG_0687.m4v'

createServer(async (req, res) => {
    
    const { size } = await fileInfo(file1)

    res.writeHead(200, {
        'Content-Length': size,
        'Content-Type': 'video/mp4'
    })
    createReadStream(file1).pipe(res)

}).listen(3001, () => { console.log('Server running on port 3001')})