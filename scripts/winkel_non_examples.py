import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os
import random
import shutil

# --- KONFIGURATION ---
OUTPUT_DIR = "winkel_nicht_beispiele_wide"
NUM_IMAGES = 20
IMAGE_SIZE = 6
DPI = 300

# Ordner neu erstellen
if os.path.exists(OUTPUT_DIR):
    shutil.rmtree(OUTPUT_DIR)
os.makedirs(OUTPUT_DIR)

def normalize_angle(angle):
    return angle % 360

def get_point_from_center(center, angle_deg, length=10):
    rad = np.radians(angle_deg)
    return (center[0] + np.cos(rad) * length, center[1] + np.sin(rad) * length)

def draw_arc(ax, center, start_deg, end_deg, radius=1.1, color='#d62728', label=None, label_color=None):
    """Zeichnet Winkelbogen. Radius etwas verkleinert (1.1) für mehr Luft."""
    s = normalize_angle(start_deg)
    e = normalize_angle(end_deg)
    
    diff_ccw = (e - s + 360) % 360
    if diff_ccw <= 180:
        t1, t2 = s, e
        width = diff_ccw
    else:
        t1, t2 = e, s
        width = 360 - diff_ccw
        
    if t2 < t1: t2 += 360

    # Bogen zeichnen
    arc = patches.Arc(center, radius*2, radius*2, angle=0, 
                      theta1=t1, theta2=t2, 
                      color=color, linewidth=2.5, zorder=10)
    ax.add_patch(arc)
    
    if label:
        if label_color is None: label_color = color
        # Label noch etwas weiter nach außen schieben (1.75x Radius) für Lesbarkeit
        mid_rad = np.radians(t1 + width / 2)
        label_dist = radius * 1.75
        lx = center[0] + np.cos(mid_rad) * label_dist
        ly = center[1] + np.sin(mid_rad) * label_dist
        ax.text(lx, ly, label, ha='center', va='center', fontsize=18, color=label_color, fontweight='bold')

def create_wide_non_example(filename, mode):
    fig, ax = plt.subplots(figsize=(IMAGE_SIZE, IMAGE_SIZE))
    
    # Limits
    ax.set_xlim(-6, 6)
    ax.set_ylim(-6, 6)
    ax.set_aspect('equal')
    ax.axis('off')
    
    c1 = (0, 0)
    base_rot = random.uniform(0, 360)
    
    # ---------------------------------------------------------
    # TYP 1: FAKE NEBENWINKEL (Weit offen)
    # ---------------------------------------------------------
    if mode == 'fake_neben':
        # Konstruktion: Ein "T", bei dem der Dachbalken geknickt ist.
        # Wir sorgen dafür, dass KEIN Winkel unter 60 Grad ist.
        
        angle_1 = base_rot
        
        # Transversale steht fast senkrecht auf Strahl 1 (85-95 Grad) -> Sehr offen
        angle_t = base_rot + random.uniform(80, 100)
        
        # Strahl 2 (der den Knick macht)
        # Normalerweise 180. Wir machen 140 (stumpfer Knick) oder 220.
        # Wenn angle_t ca 90 ist, und angle_2 140, dann ist der Winkel dazwischen 50 (grenzwertig).
        # Besser: Wir machen den Knick "nach außen" (über 180) oder Transversale kippt weg.
        
        # Strategie: Winkel Alpha ist ca 90. Winkel Beta ist ca 60-70.
        # Alpha: 90 Grad. Beta: 180 - Alpha - Fehler.
        
        angle_t = base_rot + 90  # Fixiere Transversale fast senkrecht
        
        # Der "falsche" Strahl:
        # Er soll nicht 180 sein, sondern z.B. 145 (zu eng) oder 215.
        # Wir wählen einen Winkel, der Beta auf ca 65-75 Grad zwingt.
        # Winkelabstand zu T soll min 65 sein.
        
        offset = random.choice([-1, 1]) * random.uniform(65, 75)
        angle_2 = angle_t + offset
        
        # Zeichnen
        p1 = get_point_from_center(c1, angle_1, 10)
        pt = get_point_from_center(c1, angle_t, 10)
        p2 = get_point_from_center(c1, angle_2, 10)
        
        ax.plot([c1[0], p1[0]], [c1[1], p1[1]], 'k-', lw=2.5)
        ax.plot([c1[0], pt[0]], [c1[1], pt[1]], 'k-', lw=2.5)
        ax.plot([c1[0], p2[0]], [c1[1], p2[1]], 'k-', lw=2.5)
        
        draw_arc(ax, c1, angle_1, angle_t, label=r'$\alpha$')
        draw_arc(ax, c1, angle_t, angle_2, label=r'$\beta$', color='#1f77b4')

    # ---------------------------------------------------------
    # TYP 2: FAKE SCHEITELWINKEL (Weit offen)
    # ---------------------------------------------------------
    elif mode == 'fake_scheitel':
        # Wir erzwingen ein fast rechtwinkliges Kreuz.
        # Schnittwinkel: 80-100 Grad.
        angle_line1 = base_rot
        intersect = random.uniform(80, 100)
        angle_line2_in = base_rot + intersect
        
        # Der Knick: Wir biegen die ausgehende Linie um 30 Grad ab.
        # Da wir bei ~90 starteten, landen wir bei ~60 oder ~120. Beides weit genug offen.
        kink = random.choice([-35, 35])
        angle_line2_out = angle_line2_in + 180 + kink
        
        # Zeichnen
        l1_start = get_point_from_center(c1, angle_line1, 10)
        l1_end   = get_point_from_center(c1, angle_line1 + 180, 10)
        ax.plot([l1_start[0], l1_end[0]], [l1_start[1], l1_end[1]], 'k-', lw=2.5)
        
        l2_in  = get_point_from_center(c1, angle_line2_in, 10)
        l2_out = get_point_from_center(c1, angle_line2_out, 10)
        ax.plot([c1[0], l2_in[0]],  [c1[1], l2_in[1]],  'k-', lw=2.5)
        ax.plot([c1[0], l2_out[0]], [c1[1], l2_out[1]], 'k-', lw=2.5)
        
        draw_arc(ax, c1, angle_line1, angle_line2_in, label=r'$\alpha$')
        draw_arc(ax, c1, angle_line1 + 180, angle_line2_out, label=r'$\beta$', color='#1f77b4')

    # ---------------------------------------------------------
    # TYP 3 & 4: FAKE STUFEN / WECHSEL (Weit auseinander)
    # ---------------------------------------------------------
    elif mode in ['fake_stufen', 'fake_wechsel']:
        # Abstand erhöhen
        dist = 5.0
        c1_local = np.array([0, -dist/2])
        c2_local = np.array([0, dist/2])
        
        # Wir definieren die Winkel zur Transversalen HART.
        # Winkel 1: Nahezu 90 Grad (80-100) -> Fast senkrecht.
        angle_g_local = random.uniform(85, 95)
        
        # Winkel 2: Deutlich anders, aber nicht spitz.
        # Wir wählen ~60 Grad oder ~120 Grad.
        # Das ist weit weg von 90 (also sichtbar nicht parallel), aber immer noch sehr offen.
        
        choice = random.choice(['flat', 'steep'])
        if choice == 'flat':
            angle_h_local = random.uniform(55, 65) # ca 60 Grad
        else:
            angle_h_local = random.uniform(115, 125) # ca 120 Grad
            
        # Gesamtrotation
        sys_rot_rad = np.radians(random.uniform(0, 360))
        rot_matrix = np.array([[np.cos(sys_rot_rad), -np.sin(sys_rot_rad)],
                               [np.sin(sys_rot_rad),  np.cos(sys_rot_rad)]])
        
        c1 = tuple(np.dot(rot_matrix, c1_local))
        c2 = tuple(np.dot(rot_matrix, c2_local))
        
        # Absolute Winkel
        angle_t = np.degrees(sys_rot_rad) + 90
        angle_g = np.degrees(sys_rot_rad) + angle_g_local
        angle_h = np.degrees(sys_rot_rad) + angle_h_local
        
        # Zeichnen
        t_vec = np.array(c2) - np.array(c1)
        t_vec_norm = t_vec / np.linalg.norm(t_vec) * 12
        ax.plot([c1[0]-t_vec_norm[0], c2[0]+t_vec_norm[0]], 
                [c1[1]-t_vec_norm[1], c2[1]+t_vec_norm[1]], 'k-', lw=2.5)
        
        g_start = get_point_from_center(c1, angle_g, 10)
        g_end   = get_point_from_center(c1, angle_g + 180, 10)
        ax.plot([g_start[0], g_end[0]], [g_start[1], g_end[1]], 'k-', lw=2.5)
        
        h_start = get_point_from_center(c2, angle_h, 10)
        h_end   = get_point_from_center(c2, angle_h + 180, 10)
        ax.plot([h_start[0], h_end[0]], [h_start[1], h_end[1]], 'k-', lw=2.5)
        
        # Winkel
        draw_arc(ax, c1, angle_t, angle_g, label=r'$\alpha$')
        
        if mode == 'fake_stufen':
            draw_arc(ax, c2, angle_t, angle_h, label=r'$\beta$', color='#1f77b4')
        elif mode == 'fake_wechsel':
            draw_arc(ax, c2, angle_t + 180, angle_h + 180, label=r'$\beta$', color='#1f77b4')

    plt.tight_layout()
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=DPI, bbox_inches='tight')
    plt.close()

# --- RUN ---
types = ['fake_neben', 'fake_scheitel', 'fake_stufen', 'fake_wechsel']
german_names = {
    'fake_neben': 'Fake Nebenwinkel (Offen)', 
    'fake_scheitel': 'Fake Scheitelwinkel (Offen)', 
    'fake_stufen': 'Fake Stufenwinkel (Offen)', 
    'fake_wechsel': 'Fake Wechselwinkel (Offen)'
}

print(f"Erzeuge 20 garantiert offene Gegenbeispiele in '{OUTPUT_DIR}'...")

for i in range(1, NUM_IMAGES + 1):
    mode = types[(i-1) % 4]
    filename = f"{i:02d}_{mode}.png"
    create_wide_non_example(filename, mode)
    print(f" - {filename} ({german_names[mode]})")

print("Fertig.")
