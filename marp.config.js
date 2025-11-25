// marp.config.js
const { Marp } = require('@marp-team/marp-core')
const markdownItIns = require('markdown-it-ins')

// Wir laden den HTML Code aus der externen Datei
// (Das './' bedeutet: im gleichen Ordner suchen)
const drawingToolsHTML = require('./drawing-tools.js');

module.exports = {
  inputDir: './src',
  output: './public/slides',
  themeSet: './themes/*.css',
  html: true,
  
  engine: class extends Marp {
    constructor(opts) {
      super(opts)
      // Plugin für ++Quiz++ Boxen
      this.use(markdownItIns)
      this.markdown.renderer.rules.ins_open = () => '<span class="quiz-box"><span data-marpit-fragment="1">'
      this.markdown.renderer.rules.ins_close = () => '</span></span>'
    }

    render(...args) {
      const { html, css, comments } = super.render(...args)
      
      // Hier fügen wir den geladenen Code an
      return { html: html + drawingToolsHTML, css, comments }
    }
  }
}