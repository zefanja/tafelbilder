import os
import yaml
import shutil
import subprocess
from datetime import datetime
from collections import defaultdict
from zoneinfo import ZoneInfo

# --- KONFIGURATION ---
SOURCE_DIR = 'src'
ASSETS_SUBDIR = 'assets'      # Der Ordnername in src (src/assets)

OUTPUT_DIR = 'public'
SLIDES_OUTPUT_SUBDIR = 'slides' # Der Ordner für HTML-Dateien (public/slides)
OUTPUT_FILENAME = 'index.html'

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

def get_git_mtime(filepath):
    """Holt den Timestamp des letzten Commits via Git."""
    try:
        cmd = ['git', 'log', '-1', '--format=%ct', filepath]
        output = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode().strip()
        if output and output.isdigit():
            return float(output)
    except Exception:
        pass
    return None

def parse_frontmatter(filepath):
    """Liest YAML Frontmatter."""
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
    html_parts = []
    
    for subject in sorted(data.keys()):
        html_parts.append(f'<div class="subject-section"><h2 class="subject-title">{subject}</h2>')
        areas = data[subject]
        for area in sorted(areas.keys()):
            html_parts.append(f'<div class="area-section"><h3 class="area-title">{area}</h3>')
            html_parts.append('<ul class="slide-list">')
            
            # Sortierung nach Git-Zeitstempel (neueste zuerst)
            slides = sorted(areas[area], key=lambda x: x.get('mtime', 0), reverse=True)
            
            for slide in slides:
                title = slide.get('title', 'Unbenannte Präsentation')
                
                # Datum Logik: YAML -> Git -> Leer
                display_date = slide.get('date')
                if not display_date and slide.get('mtime'):
                    display_date = datetime.fromtimestamp(slide['mtime']).strftime('%d.%m.%Y')
                if not display_date:
                    display_date = ""

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

def copy_assets():
    """Kopiert den gesamten assets Ordner von src nach public/slides."""
    source_assets = os.path.join(SOURCE_DIR, ASSETS_SUBDIR)
    
    # Ziel ist public/slides/assets, damit Markdown Referenzen wie "assets/bild.png" funktionieren
    target_assets = os.path.join(OUTPUT_DIR, SLIDES_OUTPUT_SUBDIR, ASSETS_SUBDIR)

    if os.path.exists(source_assets):
        # Wenn Zielordner existiert, löschen (sauberer State) oder Mergen. 
        # dirs_exist_ok=True bei copytree erlaubt das Überschreiben/Ergänzen
        try:
            # Ordnerstruktur sicherstellen
            if not os.path.exists(os.path.dirname(target_assets)):
                os.makedirs(os.path.dirname(target_assets))
                
            shutil.copytree(source_assets, target_assets, dirs_exist_ok=True)
            print(f"Assets kopiert: '{source_assets}' -> '{target_assets}'")
            return True
        except Exception as e:
            print(f"Fehler beim Kopieren der Assets: {e}")
    else:
        print(f"Hinweis: Kein Assets-Ordner unter '{source_assets}' gefunden.")
    return False

def main():
    # 1. Output Ordner vorbereiten
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    target_slides_dir = os.path.join(OUTPUT_DIR, SLIDES_OUTPUT_SUBDIR)
    if not os.path.exists(target_slides_dir):
        os.makedirs(target_slides_dir)

    # 2. Assets kopieren (Bilder, etc.)
    copy_assets()

    # 3. Slides verarbeiten
    data = defaultdict(lambda: defaultdict(list))
    print(f"Scanne Ordner: {SOURCE_DIR}...")
    
    if not os.path.exists(SOURCE_DIR):
        print(f"Fehler: Ordner '{SOURCE_DIR}' nicht gefunden!")
        return

    slide_count = 0
    
    for filename in os.listdir(SOURCE_DIR):
        filepath = os.path.join(SOURCE_DIR, filename)
        
        # Nur Markdown Dateien direkt im src root verarbeiten
        if filename.endswith(".md"):
            meta = parse_frontmatter(filepath)
            
            # Git Timestamp holen
            mtime = get_git_mtime(filepath)
            if mtime is None:
                mtime = os.path.getmtime(filepath) # Fallback lokal
                
            meta['mtime'] = mtime
            
            subject = meta.get('subject', 'Allgemein')
            area = meta.get('area', 'Sonstiges')
            meta['filename'] = filename
            
            data[subject][area].append(meta)
            slide_count += 1

    # 4. HTML generieren
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

if __name__ == "__main__":
    main()