import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import random
import shutil

# --- KONFIGURATION ---
OUTPUT_DIR = "winkel_bilder_hohe_aufloesung"
NUM_IMAGES = 25
IMAGE_SIZE = 6
DPI = 300  # Hohe Auflösung für Druckqualität

# Verzeichnis bereinigen und neu erstellen
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
os.makedirs(OUTPUT_DIR)

def normalize_angle(angle):
    """Bringt Winkel in den Bereich 0 <= angle < 360."""
    return angle % 360

def get_line_ends(center, angle_deg, length=10):
    """Berechnet Start- und Endpunkt einer Linie durch ein Zentrum."""
    rad = np.radians(angle_deg)
    dx = np.cos(rad) * length
    dy = np.sin(rad) * length
    return (center[0] - dx, center[1] - dy), (center[0] + dx, center[1] + dy)

def draw_perfect_arc(ax, center, start_deg, end_deg, radius=1.3, color='#d62728', label=None):
    """
    Zeichnet einen Winkelbogen. Radius leicht erhöht für bessere Sichtbarkeit bei hoher DPI.
    """
    s = normalize_angle(start_deg)
    e = normalize_angle(end_deg)
    
    # Sicherstellen, dass wir den "kurzen" Weg (Innenwinkel) zeichnen
    diff_ccw = (e - s + 360) % 360
    
    if diff_ccw <= 180:
        theta1, theta2 = s, e
        width = diff_ccw
    else:
        theta1, theta2 = e, s
        width = 360 - diff_ccw
        
    if theta2 < theta1:
        theta2 += 360

    # Bogen zeichnen
    arc = patches.Arc(center, radius*2, radius*2, angle=0, 
                      theta1=theta1, theta2=theta2, 
                      color=color, linewidth=2.5, zorder=10)
    ax.add_patch(arc)
    
    # Label berechnen
    # Label etwas weiter raus schieben, damit es nicht im Bogen klebt
    mid_rad = np.radians(theta1 + width / 2)
    label_dist = radius * 1.6 
    lx = center[0] + np.cos(mid_rad) * label_dist
    ly = center[1] + np.sin(mid_rad) * label_dist
    
    if label:
        ax.text(lx, ly, label, ha='center', va='center', fontsize=18, color=color, fontweight='bold')

def get_sectors(angle_line1, angle_line2):
    """Gibt eine Liste von 4 Tupeln (start, end) zurück, die die 4 Sektoren repräsentieren."""
    rays = [
        normalize_angle(angle_line1),
        normalize_angle(angle_line1 + 180),
        normalize_angle(angle_line2),
        normalize_angle(angle_line2 + 180)
    ]
    rays.sort()
    
    sectors = []
    for i in range(4):
        sectors.append((rays[i], rays[(i+1)%4]))
    return sectors

def create_geometry_task(filename, mode):
    fig, ax = plt.subplots(figsize=(IMAGE_SIZE, IMAGE_SIZE))
    
    # --- Geometrie Parameter ---
    base_rot = random.uniform(-15, 15) 
    intersect_angle = random.uniform(55, 125) # Etwas eingeschränkt, damit Bögen nicht zu riesig werden
    
    angle_g = base_rot
    angle_t = base_rot + intersect_angle
    
    # --- POSITIONIERUNG (Zentrierung) ---
    # Wir berechnen erst die Positionen relativ zu 0,0 und schieben sie dann in die Mitte.
    
    dist_on_t = random.uniform(3.5, 4.0) # Abstand der Schnittpunkte
    is_parallel = mode in ['stufen', 'wechsel', 'wechsel_aussen']
    
    if is_parallel:
        # C1 ist temporär bei 0,0
        c1_raw = np.array([0.0, 0.0])
        # C2 wird berechnet
        rad_t = np.radians(angle_t)
        c2_raw = np.array([np.cos(rad_t) * dist_on_t, np.sin(rad_t) * dist_on_t])
        
        # Mittelpunkt der gesamten Figur berechnen
        midpoint = (c1_raw + c2_raw) / 2
        
        # Punkte verschieben, sodass der Mittelpunkt bei (0,0) liegt
        c1 = tuple(c1_raw - midpoint)
        c2 = tuple(c2_raw - midpoint)
    else:
        # Bei Einzelkreuzung ist C1 einfach die Mitte
        c1 = (0, 0)
        c2 = None # Wird nicht gebraucht
    
    # --- PLOT SETUP ---
    # Limits leicht erhöht auf -6 bis 6 für mehr "Luft" am Rand
    ax.set_xlim(-6, 6)
    ax.set_ylim(-6, 6)
    ax.set_aspect('equal')
    ax.axis('off')

    # --- LINIEN ZEICHNEN ---
    
    # Linie g durch C1
    g1, g2 = get_line_ends(c1, angle_g, length=12)
    ax.plot([g1[0], g2[0]], [g1[1], g2[1]], 'k-', lw=2.5)

    if not is_parallel:
        # --- EINZELKREUZUNG ---
        t1, t2 = get_line_ends(c1, angle_t, length=12)
        ax.plot([t1[0], t2[0]], [t1[1], t2[1]], 'k-', lw=2.5)
        
        sectors = get_sectors(angle_g, angle_t)
        idx = random.randint(0, 3)
        s1 = sectors[idx]
        draw_perfect_arc(ax, c1, s1[0], s1[1], label=r'$\alpha$')
        
        if mode == 'scheitel':
            s2 = sectors[(idx + 2) % 4]
            draw_perfect_arc(ax, c1, s2[0], s2[1], label=r'$\alpha$')
        elif mode == 'neben':
            s2 = sectors[(idx + 1) % 4]
            draw_perfect_arc(ax, c1, s2[0], s2[1], label=r'$\beta$', color='#1f77b4')

    else:
        # --- PARALLELEN ---
        
        # Linie h durch C2 (parallel g)
        h1, h2 = get_line_ends(c2, angle_g, length=12)
        ax.plot([h1[0], h2[0]], [h1[1], h2[1]], 'k-', lw=2.5)
        
        # Transversale t durch C1 und C2
        # Da wir zentriert haben, geht sie durch den Ursprung (0,0) wenn wir alles richtig gemacht haben,
        # aber wir nutzen einfach C1 und C2 zur Definition.
        mid_of_points = ((c1[0]+c2[0])/2, (c1[1]+c2[1])/2)
        t_start, t_end = get_line_ends(mid_of_points, angle_t, length=14)
        ax.plot([t_start[0], t_end[0]], [t_start[1], t_end[1]], 'k-', lw=2.5)

        # --- SEKTOR LOGIK ---
        sectors_c1 = get_sectors(angle_g, angle_t)
        sectors_c2 = sectors_c1[:] # Identische Sektoren
        
        # Innen/Außen-Erkennung für Wechselwinkel
        angle_connection = normalize_angle(angle_t)
        
        rays = [normalize_angle(angle_g), normalize_angle(angle_g+180), 
                normalize_angle(angle_t), normalize_angle(angle_t+180)]
        rays.sort()
        
        ray_idx = -1
        for ridx, r in enumerate(rays):
            if abs(r - angle_connection) < 0.001:
                ray_idx = ridx
                break
        
        idx_inner_1 = ray_idx
        idx_inner_2 = (ray_idx - 1) % 4
        idx_outer_1 = (ray_idx + 1) % 4
        idx_outer_2 = (ray_idx + 2) % 4
        
        if mode == 'wechsel':
            # Innen (Z)
            chosen_idx = random.choice([idx_inner_1, idx_inner_2])
            draw_perfect_arc(ax, c1, sectors_c1[chosen_idx][0], sectors_c1[chosen_idx][1], label=r'$\alpha$')
            partner_idx = (chosen_idx + 2) % 4
            draw_perfect_arc(ax, c2, sectors_c2[partner_idx][0], sectors_c2[partner_idx][1], label=r'$\alpha$')
            
        elif mode == 'wechsel_aussen':
            # Außen
            chosen_idx = random.choice([idx_outer_1, idx_outer_2])
            draw_perfect_arc(ax, c1, sectors_c1[chosen_idx][0], sectors_c1[chosen_idx][1], label=r'$\alpha$')
            partner_idx = (chosen_idx + 2) % 4
            draw_perfect_arc(ax, c2, sectors_c2[partner_idx][0], sectors_c2[partner_idx][1], label=r'$\alpha$')
            
        elif mode == 'stufen':
            # F-Winkel
            chosen_idx = random.randint(0, 3)
            draw_perfect_arc(ax, c1, sectors_c1[chosen_idx][0], sectors_c1[chosen_idx][1], label=r'$\alpha$')
            draw_perfect_arc(ax, c2, sectors_c2[chosen_idx][0], sectors_c2[chosen_idx][1], label=r'$\alpha$')

    plt.tight_layout()
    # DPI=300 für Druckqualität
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=DPI, bbox_inches='tight')
    plt.close()

# --- HAUPTPROGRAMM ---
types = ['neben', 'scheitel', 'stufen', 'wechsel', 'wechsel_aussen']
german_names = {
    'neben': 'Nebenwinkel', 
    'scheitel': 'Scheitelwinkel', 
    'stufen': 'Stufenwinkel', 
    'wechsel': 'Wechselwinkel (innen)',
    'wechsel_aussen': 'Wechselwinkel (außen)'
}

print(f"Generiere {NUM_IMAGES} hochauflösende Bilder (300dpi) in '{OUTPUT_DIR}'...")

for i in range(1, NUM_IMAGES + 1):
    mode = types[(i-1) % 5]
    filename = f"{i:02d}_{mode}.png"
    create_geometry_task(filename, mode)
    print(f" - {filename} ({german_names[mode]}) erstellt.")

print("Fertig.")
