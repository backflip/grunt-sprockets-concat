var fs = require('fs')
var path = require('path')

module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      dist: {
        src: (function (file) {
          var fileCache = []

          function getFiles (targetFilePath) {
            var pattern = /\* @requires [\s-]*(.*\.js)/g
            var files = []
            var content
            var match
            var filePath
            var dependencies

            // Skip if already added to dependencies
            if (fileCache.includes(targetFilePath)) {
              return false
            } else {
              fileCache.push(targetFilePath)
            }

            // Read content
            content = fs.readFileSync(targetFilePath)

            // Find file references
            while (match = pattern.exec(content)) {
              filePath = path.join(path.dirname(targetFilePath), match[1])

              // Check existence
              if (!fs.existsSync(filePath)) {
                continue
              }

              // Get dependencies
              while (dependencies = getFiles(filePath)) {
                files = files.concat(dependencies)
              }
            }

            // Add file itself
            files.push(targetFilePath)

            return files
          }

          return getFiles(file)
        })('src/project.js'),
        dest: 'dist/built.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-contrib-concat')

  grunt.registerTask('default', ['concat'])
}
