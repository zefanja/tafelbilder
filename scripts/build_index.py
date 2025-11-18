import os
import yaml
from datetime import datetime
from collections import defaultdict

# --- KONFIGURATION ---
# Wo liegen die Markdown Dateien?
SLIDES_DIR = 'src'
# Wo soll die fertige HTML Seite gespeichert werden?
OUTPUT_DIR = 'public'
# Wie heißt die fertige Datei?
OUTPUT_FILENAME = 'index.html'

# --- HTML TEMPLATE (mit CSS für ein modernes Design) ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine Tafelbilder</title>
    <style>
        /* ALLE geschweiften Klammern MÜSSEN VERDOPPELT WERDEN */
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f4f4f9; }}
        header {{ text-align: center; margin-bottom: 40px; }}
        h1 {{ color: #2c3e50; }}
        .subject-section {{ background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); margin-bottom: 30px; }}
        h2.subject-title {{ border-bottom: 2px solid #3498db; padding-bottom: 10px; color: #2980b9; margin-top: 0; }}
        .area-section {{ margin-top: 20px; padding-left: 10px; }}
        h3.area-title {{ color: #7f8c8d; font-size: 1.1em; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }}
        ul.slide-list {{ list-style: none; padding: 0; }}
        li.slide-item {{ margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 5px; }}
        a.slide-link {{ text-decoration: none; color: #2c3e50; font-weight: bold; font-size: 1.1em; }}
        a.slide-link:hover {{ color: #3498db; }}
        span.slide-date {{ font-size: 0.85em; color: #999; background: #eee; padding: 2px 6px; border-radius: 4px; }}
        .empty-msg {{ color: #999; font-style: italic; }}
    </style>
</head>
<body>
    <header>
        <h1>📚 Vorlesungsübersicht</h1>
        <p>Alle Slides und Unterlagen auf einen Blick.</p>
    </header>

    <div id="content">
        {content} 
    </div>
    
    <footer style="text-align: center; margin-top: 50px; color: #aaa; font-size: 0.8em;">
        Generiert am {gen_date}
    </footer>
</body>
</html>
"""

def parse_frontmatter(filepath):
    """Liest YAML Frontmatter aus einer MD-Datei."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Einfache Trennung von Frontmatter und Inhalt
    if content.startswith('---'):
        try:
            parts = content.split('---', 2)
            if len(parts) >= 3:
                metadata = yaml.safe_load(parts[1])
                return metadata
        except yaml.YAMLError as e:
            print(f"Fehler beim Parsen von {filepath}: {e}")
    return {}

def generate_html_structure(data):
    """Baut den HTML String aus den gruppierten Daten."""
    html_parts = []
    
    # Sortiere Fächer alphabetisch
    for subject in sorted(data.keys()):
        html_parts.append(f'<div class="subject-section"><h2 class="subject-title">{subject}</h2>')
        
        areas = data[subject]
        # Sortiere Lernbereiche alphabetisch
        for area in sorted(areas.keys()):
            html_parts.append(f'<div class="area-section"><h3 class="area-title">{area}</h3>')
            html_parts.append('<ul class="slide-list">')
            
            # Sortiere Slides nach Datum (neueste zuerst)
            # Wir gehen davon aus, dass das Datum als String "YYYY-MM-DD" vorliegt -> string sortierung reicht
            slides = sorted(areas[area], key=lambda x: x.get('date', '0000-00-00'), reverse=True)
            
            for slide in slides:
                title = slide.get('title', 'Unbenannte Präsentation')
                date = slide.get('date', '')
                # Der Link zeigt auf public/slides/dateiname.html
                # Da die index.html im public root liegt, ist der Pfad 'slides/...'
                link = f"slides/{slide['filename'].replace('.md', '.html')}"
                
                html_parts.append(f'''
                    <li class="slide-item">
                        <a href="{link}" class="slide-link">{title}</a>
                        <span class="slide-date">{date}</span>
                    </li>
                ''')
            
            html_parts.append('</ul></div>')
        
        html_parts.append('</div>')
    
    if not html_parts:
        return '<p class="empty-msg">Keine Präsentationen gefunden.</p>'
        
    return "\n".join(html_parts)

def main():
    # Prüfen ob Output Ordner existiert
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Datenstruktur: nested dictionary
    # data['Informatik']['Programmierung'] = [slide1, slide2]
    data = defaultdict(lambda: defaultdict(list))

    print(f"Scanne Ordner: {SLIDES_DIR}...")
    
    if not os.path.exists(SLIDES_DIR):
        print(f"Fehler: Ordner '{SLIDES_DIR}' nicht gefunden!")
        return

    # Dateien scannen
    count = 0
    for filename in os.listdir(SLIDES_DIR):
        if filename.endswith(".md"):
            filepath = os.path.join(SLIDES_DIR, filename)
            meta = parse_frontmatter(filepath)
            
            # Fallback, falls Felder fehlen
            subject = meta.get('subject', 'Allgemein')
            area = meta.get('area', 'Sonstiges')
            
            # Filename hinzufügen für den Link
            meta['filename'] = filename
            
            # Zur Struktur hinzufügen
            data[subject][area].append(meta)
            count += 1

    # HTML generieren
    content_html = generate_html_structure(data)
    final_html = HTML_TEMPLATE.format(
        content = content_html,
        gen_date = datetime.now().strftime("%d.%m.%Y %H:%M")
    )

    # Schreiben
    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_html)

    print(f"Fertig! Index mit {count} Slides erstellt: {output_path}")

if __name__ == "__main__":
    main()