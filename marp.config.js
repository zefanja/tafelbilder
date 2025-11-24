const { Marp } = require('@marp-team/marp-core')
const markdownItIns = require('markdown-it-ins')

module.exports = {
  // 1. Hier definieren wir Input, Output und Themes zentral
  inputDir: './src',
  output: './public/slides',
  themeSet: './themes/*.css',
  html: true,
  
  // 2. Hier konfigurieren wir die Engine und fügen das Plugin hinzu
  engine: class extends Marp {
    constructor(opts) {
      super(opts)
      
      // 1. Plugin laden (damit ++ erkannt wird)
      this.use(markdownItIns)

      // 2. Deine Custom-Regeln definieren
      // WICHTIG: Wir nutzen 'this.markdown' statt 'marp'
      
      // Öffnendes Tag (++): Box starten + Fragment aktivieren
      this.markdown.renderer.rules.ins_open = () => {
        return '<span class="quiz-box"><span data-marpit-fragment="1">'
      }

      // Schließendes Tag (++): Beide spans schließen
      this.markdown.renderer.rules.ins_close = () => {
        return '</span></span>'
      }
    }
  }
}