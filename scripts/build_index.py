import os
import yaml
import shutil
from datetime import datetime
from collections import defaultdict
from zoneinfo import ZoneInfo

# --- KONFIGURATION ---
SLIDES_DIR = 'src'
OUTPUT_DIR = 'public'
# Ordner für die generierten HTML-Folien (innerhalb von public)
SLIDES_OUTPUT_SUBDIR = 'slides' 
OUTPUT_FILENAME = 'index.html'

IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'}

# --- HTML TEMPLATE ---
HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meine Tafelbilder</title>
    <style>
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
        <h1>📚 Tafelbilder</h1>
        <p>Alle Slides und Unterlagen auf einen Blick.</p>

        <button onclick="location.reload()" 
                style="padding: 8px 15px; background-color: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; margin-top: 10px;">
            Seite neu laden 🔄
        </button>
    </header>

    <div id="content">
        {content} 
    </div>
    
    <footer style="text-align: center; margin-top: 50px; color: #aaa; font-size: 0.8em;">
        Generiert am {gen_date} (Berlin)
    </footer>
</body>
</html>
"""

def parse_frontmatter(filepath):
    """Liest YAML Frontmatter aus einer MD-Datei."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if content.startswith('---'):
        try:
            parts = content.split('---', 2)
            if len(parts) >= 3:
                return yaml.safe_load(parts[1])
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
            
            # --- NEUE SORTIERUNG ---
            # Wir nutzen den 'mtime' (modification time) Zeitstempel, den wir beim Einlesen gespeichert haben.
            # reverse=True -> Höchste Zahl (neuestes Datum) zuerst.
            slides = sorted(areas[area], key=lambda x: x.get('mtime', 0), reverse=True)
            
            for slide in slides:
                title = slide.get('title', 'Unbenannte Präsentation')
                
                # Wir zeigen trotzdem das Datum aus dem Frontmatter an, falls vorhanden,
                # sonst das Änderungsdatum der Datei.
                display_date = slide.get('date')
                if not display_date:
                    # Fallback: Zeige das Datei-Datum an, wenn im YAML nichts steht
                    display_date = datetime.fromtimestamp(slide['mtime']).strftime('%d.%m.%Y')
                
                link = f"{SLIDES_OUTPUT_SUBDIR}/{slide['filename'].replace('.md', '.html')}"
                
                html_parts.append(f'''
                    <li class="slide-item">
                        <a href="{link}" class="slide-link">{title}</a>
                        <span class="slide-date">{display_date}</span>
                    </li>
                ''')
            
            html_parts.append('</ul></div>')
        
        html_parts.append('</div>')
    
    if not html_parts:
        return '<p class="empty-msg">Keine Präsentationen gefunden.</p>'
        
    return "\n".join(html_parts)

def main():
    # Ordnerstruktur erstellen
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    target_slides_dir = os.path.join(OUTPUT_DIR, SLIDES_OUTPUT_SUBDIR)
    if not os.path.exists(target_slides_dir):
        os.makedirs(target_slides_dir)

    data = defaultdict(lambda: defaultdict(list))

    print(f"Scanne Ordner: {SLIDES_DIR}...")
    
    if not os.path.exists(SLIDES_DIR):
        print(f"Fehler: Ordner '{SLIDES_DIR}' nicht gefunden!")
        return

    slide_count = 0
    image_count = 0
    
    for filename in os.listdir(SLIDES_DIR):
        filepath = os.path.join(SLIDES_DIR, filename)
        
        # --- Markdown Dateien ---
        if filename.endswith(".md"):
            # Metadaten lesen
            meta = parse_frontmatter(filepath)
            
            # WICHTIG: Datei-Änderungsdatum auslesen (Timestamp)
            mtime = os.path.getmtime(filepath)
            meta['mtime'] = mtime
            
            subject = meta.get('subject', 'Allgemein')
            area = meta.get('area', 'Sonstiges')
            meta['filename'] = filename
            
            data[subject][area].append(meta)
            slide_count += 1
            
        # --- Bilder Kopieren ---
        else:
            ext = os.path.splitext(filename)[1].lower()
            if ext in IMAGE_EXTENSIONS:
                target_path = os.path.join(target_slides_dir, filename)
                try:
                    shutil.copy2(filepath, target_path)
                    image_count += 1
                except Exception as e:
                    print(f"Fehler beim Kopieren von {filename}: {e}")

    # HTML generieren
    content_html = generate_html_structure(data)
    
    berlin_tz = ZoneInfo("Europe/Berlin")
    current_time = datetime.now(berlin_tz).strftime("%d.%m.%Y %H:%M")
    
    final_html = HTML_TEMPLATE.format(
        content = content_html,
        gen_date = current_time
    )

    output_path = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(final_html)

    print(f"Fertig! Index mit {slide_count} Slides erstellt.")
    print(f"{image_count} Bilder wurden nach '{target_slides_dir}' kopiert.")

if __name__ == "__main__":
    main()