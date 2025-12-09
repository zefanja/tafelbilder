import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np
import os

# --- KONFIGURATION ---
# Zielverzeichnis für die Bilder
output_dir = "../src/assets/"

# Erstelle das Verzeichnis, falls es noch nicht existiert
os.makedirs(output_dir, exist_ok=True)

def setup_grid(ax, x_lim=(-1, 11), y_lim=(-1, 7)):
    """Erstellt das Koordinatengitter und die Symmetrieachse."""
    ax.set_xlim(x_lim)
    ax.set_ylim(y_lim)
    ax.set_aspect('equal')
    # Gitterlinien
    ax.grid(True, which='both', linestyle='-', linewidth=1, color='gray', alpha=0.5)
    # Achsenbeschriftung (nur Ticks, keine Zahlen für saubereren Look)
    ax.set_xticks(np.arange(x_lim[0], x_lim[1]+1, 1))
    ax.set_yticks(np.arange(y_lim[0], y_lim[1]+1, 1))
    ax.set_xticklabels([])
    ax.set_yticklabels([])
    
    # Symmetrieachse g (rot, gestrichelt) bei x=5
    ax.axvline(x=5, color='red', linewidth=2, linestyle='--')
    ax.text(5.1, 6.5, 'g', color='red', fontsize=14, fontweight='bold')

def save_fig(filename):
    """Speichert die Grafik im definierten Ausgabeordner."""
    filepath = os.path.join(output_dir, filename)
    plt.savefig(filepath, bbox_inches='tight', dpi=150)
    plt.close()
    print(f"Erstellt: {filepath}")

# ==========================================
# 1. BILD: Vorwissen (Punkt P)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)
ax.plot(2, 3, 'bo', markersize=8)
ax.text(1.5, 3.2, 'P', fontsize=12, color='blue')
save_fig('img_01_spiegeln.png')

fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)
ax.plot(3, 4, 'bo', markersize=8)
ax.text(2.5, 4.2, 'S', fontsize=12, color='blue')
save_fig('img_02_spiegeln.png')


# ==========================================
# 2. BILD: Silent Teacher 1 (Abstand 2)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)
ax.plot(3, 4, 'bo', markersize=8) # Punkt links
ax.plot(7, 4, 'ro', markersize=8) # Punkt rechts (Spiegelbild)
# Pfeile für den Abstand
ax.annotate("", xy=(5, 4), xytext=(3, 4), arrowprops=dict(arrowstyle="<->", color='green', lw=2))
ax.annotate("", xy=(7, 4), xytext=(5, 4), arrowprops=dict(arrowstyle="<->", color='green', lw=2))
save_fig('img_08_trans_1.png')

# ==========================================
# 3. BILD: Silent Teacher 2 (Abstand 4)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)
ax.plot(1, 2, 'bo', markersize=8) # Punkt links
ax.plot(9, 2, 'ro', markersize=8) # Punkt rechts
# Pfeile für den Abstand
ax.annotate("", xy=(5, 2), xytext=(1, 2), arrowprops=dict(arrowstyle="<->", color='orange', lw=2))
ax.annotate("", xy=(9, 2), xytext=(5, 2), arrowprops=dict(arrowstyle="<->", color='orange', lw=2))
save_fig('img_09_trans_2.png')

# ==========================================
# 4. BILD: I DO Blank (Viereck ABCD)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)

# KORREKTUR: Punkt D auf (2, 3) gesetzt, damit er nicht auf der Linie AB liegt
points = {'A': (3, 5), 'B': (0, 2), 'C': (5, 1), 'D': (2, 3)}
verts = [points['A'], points['B'], points['C'], points['D']]

# Polygon zeichnen
poly = patches.Polygon(verts, closed=True, fill=True, facecolor='lightblue', edgecolor='blue', alpha=0.5)
ax.add_patch(poly)

# Punkte zeichnen und beschriften
for p, coord in points.items():
    ax.plot(coord[0], coord[1], 'bo')
    ax.text(coord[0]-0.4, coord[1], p, fontsize=12, color='blue')

save_fig('img_10_ido_blank.png')

# ==========================================
# 5. BILD: I DO Solved (Mit Spiegelbild)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)

# Original Viereck (Wiederholung)
ax.add_patch(patches.Polygon(verts, closed=True, fill=True, facecolor='lightblue', edgecolor='blue', alpha=0.5))
for p, coord in points.items():
    ax.plot(coord[0], coord[1], 'bo')
    ax.text(coord[0]-0.4, coord[1], p, fontsize=12, color='blue')

# Spiegelung berechnen
# x' = Achse + (Achse - x) = 5 + (5 - x) = 10 - x
# y' = y (bleibt gleich)
points_prime = {}
for p_name, coord in points.items():
    x, y = coord
    points_prime[f"{p_name}'"] = (10 - x, y)

verts_prime = [points_prime["A'"], points_prime["B'"], points_prime["C'"], points_prime["D'"]]

# Gespiegeltes Polygon zeichnen
poly_prime = patches.Polygon(verts_prime, closed=True, fill=True, facecolor='lightgreen', edgecolor='green', alpha=0.5)
ax.add_patch(poly_prime)

# Gespiegelte Punkte zeichnen
for p_name, coord in points_prime.items():
    # C' nicht doppelt zeichnen, wenn es auf der Achse liegt (optional)
    # Hier zeichnen wir es trotzdem für die Klarheit
    ax.plot(coord[0], coord[1], 'go')
    # Beschriftung leicht versetzt
    ax.text(coord[0]+0.2, coord[1], p_name, fontsize=12, color='green')

save_fig('img_11_ido_solved.png')

# ==========================================
# 6. BILD: WE DO Blank (Dreieck XYZ)
# ==========================================
fig, ax = plt.subplots(figsize=(6, 4))
setup_grid(ax)

# Dreieck X(1, 5), Y(1, 2), Z(3, 2)
points_tri = {'X': (1, 5), 'Y': (1, 2), 'Z': (3, 2)}
verts_tri = [points_tri['X'], points_tri['Y'], points_tri['Z']]

poly_tri = patches.Polygon(verts_tri, closed=True, fill=True, facecolor='orange', edgecolor='darkorange', alpha=0.5)
ax.add_patch(poly_tri)

for p, coord in points_tri.items():
    ax.plot(coord[0], coord[1], 'ko')
    ax.text(coord[0]-0.4, coord[1], p, fontsize=12)

save_fig('img_12_wedo_blank.png')

print("Fertig! Alle Bilder wurden in '../src/assets/' gespeichert.")