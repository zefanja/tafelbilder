const { Marp } = require('@marp-team/marp-core')
const markdownItIns = require('markdown-it-ins')

module.exports = {
  // 1. Hier definieren wir Input, Output und Themes zentral
  inputDir: './src',
  output: './public/slides',
  themeSet: './themes/*.css',
  
  // 2. Hier konfigurieren wir die Engine und fügen das Plugin hinzu
  engine: ({ marp }) => {
    marp.use(markdownItIns);

    // Öffnendes Tag: Erst der graue Kasten, dann das Fragment
    marp.renderer.rules.ins_open = () => {
      return '<span class="quiz-box"><span data-marpit-fragment>'; 
    };

    // Schließendes Tag: Beide schließen
    marp.renderer.rules.ins_close = () => {
      return '</span></span>';
    };

    return marp;
  }
}