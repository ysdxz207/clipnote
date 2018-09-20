const childProcess = require('child_process')
const _ = require('lodash')
const os = require('os')
const path = require('path')

function EIconExtractor() {
    this.getIcon = function (context, path, callback) {
        let iconDataBuffer = ''
        let iconProcess = childProcess.spawn(getPlatformIconProcess(), ['-x'])
        let json = JSON.stringify({context: context, path: path}) + '\n'
        iconProcess.stdin.write(json)
        iconProcess.stdout.on('data', function (data) {
            let str = (Buffer.from(data, 'utf8')).toString()

            iconDataBuffer += str

            // Bail if we don't have a complete string to parse yet.
            if (!_.endsWith(str, '\n')) {
                return
            }

            // We might get more than one in the return, so we need to split that too.
            _.each(iconDataBuffer.split('\n'), function (buf) {
                if (!buf || buf.length === 0) {
                    return
                }

                try {
                    callback(JSON.parse(iconDataBuffer))
                } catch (ex) {
                    callback(null, ex)
                }
            })
        })
    }

    function getPlatformIconProcess() {
        if (os.type() === 'Windows_NT') {
            return path.join(__static, '/assets/bin/IconExtractor.exe')
            // Do stuff here to get the icon that doesn't have the shortcut thing on it
        } else {
            console.error('This platform (' + os.type() + ') is unsupported =(')
        }
    }
}

export default new EIconExtractor()
