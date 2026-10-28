import os
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

REPO_ROOT = '/home/jairus/Antonius Jairus/Projects/Portfolio'
HERO_DIR = os.path.join(REPO_ROOT, '.github/readme-assets/hero')
SEP_DIR = os.path.join(REPO_ROOT, '.github/readme-assets/separators')
PROJ_DIR = os.path.join(REPO_ROOT, '.github/readme-assets/projects')

os.makedirs(HERO_DIR, exist_ok=True)
os.makedirs(SEP_DIR, exist_ok=True)
os.makedirs(PROJ_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. RENDER 3D MONOLITH HERO (Looping WebP + GIF)
# ---------------------------------------------------------------------------
def render_hero_animation(num_frames=48, width=860, height=430):
    print(f"Rendering {num_frames} frames for Hero Monolith...")
    temp_dir = '/tmp/hero_frames'
    os.makedirs(temp_dir, exist_ok=True)
    
    cx, cy = width // 2, height // 2 - 10
    
    # Pre-generate 36 floating dust particles with deterministic pseudo-random paths
    np.random.seed(42)
    particle_bases = np.random.uniform(-3.5, 3.5, (36, 3))
    particle_speeds = np.random.uniform(0.1, 0.4, (36,))
    
    for frame_idx in range(num_frames):
        t = frame_idx / float(num_frames)
        angle = t * 2.0 * math.pi
        
        im = Image.new('RGB', (width, height), (12, 9, 7)) # #0C0907
        draw = ImageDraw.Draw(im, 'RGBA')
        
        # Atmospheric ambient radial lighting
        for r in range(260, 20, -25):
            alpha = int(22 * (1.0 - r / 260.0))
            draw.ellipse([cx - r * 1.7, cy - r * 0.9, cx + r * 1.7, cy + r * 0.9], fill=(45, 32, 22, alpha))
            
        # Subtle Crimson Accent on lower-left
        draw.ellipse([cx - 360, cy + 20, cx - 120, cy + 260], fill=(139, 30, 45, 12))
        # Subtle Champagne Accent on upper-right
        draw.ellipse([cx + 120, cy - 220, cx + 360, cy + 20], fill=(224, 169, 59, 10))

        # Ground grid receding toward horizon
        grid_y_horizon = cy + 65
        for x_offset in range(-width, width * 2, 55):
            x1 = cx + (x_offset - cx) * 0.12
            x2 = cx + (x_offset - cx) * 1.75
            draw.line([(x1, grid_y_horizon), (x2, height)], fill=(34, 28, 24, 40), width=1)
            
        for dist in range(1, 8):
            y = grid_y_horizon + int((dist / 7.0) ** 1.85 * (height - grid_y_horizon))
            alpha = int(8 + dist * 5)
            draw.line([(0, y), (width, y)], fill=(34, 28, 24, alpha), width=1)

        # Monolith dimensions: width=0.68, height=1.75, depth=0.24
        w, h, d = 0.68, 1.75, 0.24
        corners = np.array([
            [-w, -h, -d], [w, -h, -d], [w, h, -d], [-w, h, -d],
            [-w, -h,  d], [w, -h,  d], [w, h,  d], [-w, h,  d]
        ], dtype=float)
        
        # Rotation
        cos_x, sin_x = math.cos(0.22), math.sin(0.22)
        Rx = np.array([[1, 0, 0], [0, cos_x, -sin_x], [0, sin_x, cos_x]])
        
        cos_y, sin_y = math.cos(angle), math.sin(angle)
        Ry = np.array([[cos_y, 0, sin_y], [0, 1, 0], [-sin_y, 0, cos_y]])
        
        cos_z, sin_z = math.cos(-0.05), math.sin(-0.05)
        Rz = np.array([[cos_z, -sin_z, 0], [sin_z, cos_z, 0], [0, 0, 1]])
        
        R = Rz @ Rx @ Ry
        rot_corners = corners @ R.T
        
        cam_dist = 6.4
        scale = 410.0
        
        proj_corners = []
        for p in rot_corners:
            z = p[2] + cam_dist
            px = cx + (p[0] / z) * scale
            py = cy + (p[1] / z) * scale
            proj_corners.append((px, py, z))
            
        faces = [
            ([0, 1, 2, 3], np.array([0, 0, -1.0])),
            ([4, 5, 6, 7], np.array([0, 0, 1.0])),
            ([0, 1, 5, 4], np.array([0, -1.0, 0])),
            ([2, 3, 7, 6], np.array([0, 1.0, 0])),
            ([0, 3, 7, 4], np.array([-1.0, 0, 0])),
            ([1, 2, 6, 5], np.array([1.0, 0, 0])),
        ]
        
        light_key = np.array([1.4, 1.8, 2.0])
        light_key /= np.linalg.norm(light_key)
        
        light_rim = np.array([-2.2, -1.0, -1.8])
        light_rim /= np.linalg.norm(light_rim)
        
        view_dir = np.array([0, 0, 1.0])
        
        face_render_list = []
        for idx_list, norm in faces:
            rot_norm = norm @ R.T
            z_avg = sum(proj_corners[i][2] for i in idx_list) / len(idx_list)
            if rot_norm[2] > -0.05:
                face_render_list.append((z_avg, idx_list, rot_norm))
                
        face_render_list.sort(key=lambda x: -x[0])
        
        for z_avg, idx_list, rot_norm in face_render_list:
            poly = [(proj_corners[i][0], proj_corners[i][1]) for i in idx_list]
            
            dot_key = max(0.0, float(np.dot(rot_norm, light_key)))
            dot_rim = max(0.0, float(np.dot(rot_norm, light_rim)))
            
            half_vec = (light_key + view_dir)
            half_vec /= np.linalg.norm(half_vec)
            spec = max(0.0, float(np.dot(rot_norm, half_vec))) ** 26
            
            r = int(18 + dot_key * 115 + dot_rim * 70 + spec * 175)
            g = int(16 + dot_key * 95  + dot_rim * 18 + spec * 155)
            b = int(14 + dot_key * 50  + dot_rim * 28 + spec * 110)
            
            r = min(255, max(0, r))
            g = min(255, max(0, g))
            b = min(255, max(0, b))
            
            draw.polygon(poly, fill=(r, g, b, 245))
            
            # Polished beveled edge outline
            edge_r = min(255, int(r * 1.45 + 45))
            edge_g = min(255, int(g * 1.45 + 40))
            edge_b = min(255, int(b * 1.45 + 28))
            draw.polygon(poly, outline=(edge_r, edge_g, edge_b, 210))

        # Floating orbital ring (tilted thin elliptical halo)
        ring_pts = 72
        ring_radius = 2.1
        ring_pts_3d = []
        for k in range(ring_pts):
            th = (k / ring_pts) * 2 * math.pi
            rx = ring_radius * math.cos(th)
            rz = ring_radius * math.sin(th)
            ry = 0.0
            p = np.array([rx, ry * math.cos(0.55) - rz * math.sin(0.55), ry * math.sin(0.55) + rz * math.cos(0.55)])
            cos_rt, sin_rt = math.cos(-angle * 0.35), math.sin(-angle * 0.35)
            p_rot = np.array([p[0] * cos_rt + p[2] * sin_rt, p[1], -p[0] * sin_rt + p[2] * cos_rt])
            
            z = p_rot[2] + cam_dist
            px = cx + (p_rot[0] / z) * scale
            py = cy + (p_rot[1] / z) * scale
            ring_pts_3d.append((px, py, z))
            
        for k in range(ring_pts):
            p1 = ring_pts_3d[k]
            p2 = ring_pts_3d[(k + 1) % ring_pts]
            alpha = int(40 + (1.0 - (p1[2] - 4.5) / 3.0) * 85)
            alpha = max(15, min(150, alpha))
            if k % 4 != 0:
                draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(224, 169, 59, alpha), width=1)
                
        # Drifting particles
        for p_idx in range(len(particle_bases)):
            pb = particle_bases[p_idx].copy()
            pb[1] += (t * particle_speeds[p_idx] * 2.0) % 2.0 - 1.0
            z = pb[2] + cam_dist
            if z > 1.0:
                px = cx + (pb[0] / z) * scale
                py = cy + (pb[1] / z) * scale
                if 0 <= px < width and 0 <= py < height:
                    p_alpha = int(35 + 25 * math.sin(angle + p_idx))
                    draw.point((px, py), fill=(235, 210, 160, p_alpha))

        # Vignette borders
        for x in range(35):
            val = int(255 * (1.0 - x / 35.0))
            draw.line([(x, 0), (x, height)], fill=(12, 9, 7, val))
            draw.line([(width - 1 - x, 0), (width - 1 - x, height)], fill=(12, 9, 7, val))

        im.save(f"{temp_dir}/frame_{frame_idx:03d}.png")
        
    webp_path = os.path.join(HERO_DIR, 'hero-monolith.webp')
    gif_path = os.path.join(HERO_DIR, 'hero-monolith.gif')
    
    subprocess.run([
        'ffmpeg', '-y', '-r', '20', '-i', f"{temp_dir}/frame_%03d.png",
        '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '72', '-loop', '0',
        webp_path
    ], check=True)
    
    subprocess.run([
        'ffmpeg', '-y', '-r', '20', '-i', f"{temp_dir}/frame_%03d.png",
        '-vf', 'split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
        gif_path
    ], check=True)
    
    print(f"Hero generated! WebP: {os.path.getsize(webp_path) / 1024:.1f} KB, GIF: {os.path.getsize(gif_path) / 1024:.1f} KB")


# ---------------------------------------------------------------------------
# 2. RENDER 3D SEPARATOR (Rotating Wireframe Geodesic Ring)
# ---------------------------------------------------------------------------
def render_separator_animation(num_frames=36, width=860, height=80):
    print(f"Rendering {num_frames} frames for Separator...")
    temp_dir = '/tmp/sep_frames'
    os.makedirs(temp_dir, exist_ok=True)
    
    cx, cy = width // 2, height // 2
    
    for frame_idx in range(num_frames):
        t = frame_idx / float(num_frames)
        angle = t * 2.0 * math.pi
        
        im = Image.new('RGB', (width, height), (12, 9, 7))
        draw = ImageDraw.Draw(im, 'RGBA')
        
        draw.line([(0, cy), (width, cy)], fill=(28, 22, 18, 120), width=1)
        draw.ellipse([cx - 90, cy - 25, cx + 90, cy + 25], fill=(224, 169, 59, 12))
        
        num_pts = 32
        radius = 2.4
        cam_dist = 5.5
        scale = 130.0
        
        pts_3d = []
        for i in range(num_pts):
            theta = (i / num_pts) * 2 * math.pi
            x = radius * math.cos(theta)
            y = 0.45 * math.sin(theta * 3.0 + angle)
            z = radius * math.sin(theta)
            
            cos_a, sin_a = math.cos(angle), math.sin(angle)
            rx = x * cos_a + z * sin_a
            ry = y
            rz = -x * sin_a + z * cos_a
            
            z_proj = rz + cam_dist
            px = cx + (rx / z_proj) * scale
            py = cy + (ry / z_proj) * scale
            pts_3d.append((px, py, z_proj))
            
        for i in range(num_pts):
            p1 = pts_3d[i]
            p2 = pts_3d[(i + 1) % num_pts]
            alpha = int(45 + (1.0 - (p1[2] - 3.5) / 4.0) * 120)
            alpha = max(20, min(180, alpha))
            draw.line([(p1[0], p1[1]), (p2[0], p2[1])], fill=(224, 169, 59, alpha), width=1)
            if i % 4 == 0:
                draw.line([(p1[0], p1[1]), (cx, cy)], fill=(139, 30, 45, int(alpha * 0.45)), width=1)
                
        im.save(f"{temp_dir}/frame_{frame_idx:03d}.png")
        
    webp_path = os.path.join(SEP_DIR, 'separator-3d.webp')
    gif_path = os.path.join(SEP_DIR, 'separator-3d.gif')
    
    subprocess.run([
        'ffmpeg', '-y', '-r', '20', '-i', f"{temp_dir}/frame_%03d.png",
        '-vcodec', 'libwebp', '-lossless', '0', '-q:v', '72', '-loop', '0',
        webp_path
    ], check=True)
    
    subprocess.run([
        'ffmpeg', '-y', '-r', '20', '-i', f"{temp_dir}/frame_%03d.png",
        '-vf', 'split[s0][s1];[s0]palettegen=max_colors=64[p];[s1][p]paletteuse=dither=bayer',
        gif_path
    ], check=True)
    
    print(f"Separator generated! WebP: {os.path.getsize(webp_path) / 1024:.1f} KB, GIF: {os.path.getsize(gif_path) / 1024:.1f} KB")


# ---------------------------------------------------------------------------
# 3. GENERATE CINEMATIC PROJECT BANNERS (5 Projects)
# ---------------------------------------------------------------------------
def generate_project_banners():
    print("Generating cinematic project banners...")
    
    font_mono = ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Bold.otf', 14)
    font_title = ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-Bold.otf', 26)
    font_desc = ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusSans-Regular.otf', 15)
    font_tags = ImageFont.truetype('/usr/share/fonts/opentype/urw-base35/NimbusMonoPS-Regular.otf', 12)
    
    projects = [
        {
            'file': '01-kaiforge.png',
            'num': '01',
            'title': 'KAIFORGE',
            'kicker': 'SPORTS ANALYTICS & INTELLIGENCE',
            'desc': 'Performance intelligence & match analytics platform for competitive table tennis.',
            'tags': ['React', 'Supabase', 'Analytics', 'PWA', 'TypeScript'],
            'screenshot': os.path.join(REPO_ROOT, 'public/images/ventures/kaiforge/Screenshot From 2026-10-02 16-25-38.png'),
            'accent': (224, 169, 59),
        },
        {
            'file': '02-palindrome.png',
            'num': '02',
            'title': 'PALINDROME',
            'kicker': 'FINANCIAL VISUALIZATION & DATA EXPERIENCE',
            'desc': 'Financial visualization without losing the contextual relationships behind the numbers.',
            'tags': ['Next.js', 'WebGL', 'Three.js', 'Data Experience', 'UI/UX'],
            'screenshot': os.path.join(REPO_ROOT, 'public/images/ventures/palindrome/Screenshot From 2026-10-02 14-19-25.png'),
            'accent': (212, 175, 55),
        },
        {
            'file': '03-neuroshield.png',
            'num': '03',
            'title': 'NEUROSHIELD.AI',
            'kicker': 'HEALTHCARE AI & MULTIMODAL RESEARCH',
            'desc': 'AI-assisted research platform for early-stage Alzheimer\'s prediction using multimodal medical data.',
            'tags': ['PyTorch', 'Multimodal AI', 'Deep Learning', 'Medical Imaging'],
            'screenshot': os.path.join(REPO_ROOT, 'public/images/ventures/neuroshield/Screenshot From 2026-10-02 16-40-26.png'),
            'accent': (184, 58, 75),
        },
        {
            'file': '04-rajamanickam-chit-fund.png',
            'num': '04',
            'title': 'RAJAMANICKAM CHIT FUND',
            'kicker': 'FINANCIAL OPERATIONS & ENTERPRISE PORTAL',
            'desc': 'Admin-first chit fund management system for auction tracking, ledger reconciliations & dues.',
            'tags': ['Mobile-First', 'Operations', 'Finance', 'Enterprise Dashboard'],
            'screenshot': os.path.join(REPO_ROOT, 'public/images/work-with-me/project-02-pricing.png'),
            'accent': (224, 169, 59),
        },
        {
            'file': '05-portfolio.png',
            'num': '05',
            'title': 'ANTONIUS JAIRUS PORTFOLIO',
            'kicker': 'INTERACTIVE DIGITAL PORTFOLIO & WEBGL EXPERIENCE',
            'desc': 'Experimental interactive portfolio combining engineering, typography, motion & real-time 3D.',
            'tags': ['Next.js 16', 'Three.js', 'React Three Fiber', 'GSAP Choreography', 'WebGL'],
            'screenshot': os.path.join(REPO_ROOT, 'public/images/og-preview.png'),
            'accent': (224, 169, 59),
        },
    ]
    
    W, H = 1000, 520
    
    for p in projects:
        im = Image.new('RGB', (W, H), (14, 11, 9))
        draw = ImageDraw.Draw(im, 'RGBA')
        
        draw.rounded_rectangle([0, 0, W - 1, H - 1], radius=16, outline=(42, 34, 28, 255), width=1)
        draw.ellipse([-50, -50, 300, 200], fill=(p['accent'][0], p['accent'][1], p['accent'][2], 12))
        
        # 1. Header Typography
        kicker_text = f"{p['num']} / {p['kicker']}"
        draw.text((36, 26), kicker_text, fill=p['accent'], font=font_mono)
        draw.text((36, 48), p['title'], fill=(237, 230, 221), font=font_title)
        draw.text((36, 84), p['desc'], fill=(185, 175, 165), font=font_desc)
        
        tag_x = 36
        for tag in p['tags']:
            tw = len(tag) * 8 + 20
            draw.rounded_rectangle([tag_x, 112, tag_x + tw, 134], radius=6, fill=(24, 19, 16, 255), outline=(52, 42, 35, 255), width=1)
            draw.text((tag_x + 10, 116), tag, fill=(210, 195, 180), font=font_tags)
            tag_x += tw + 10
            
        # 2. Window Mockup
        win_x1, win_y1, win_x2, win_y2 = 36, 150, W - 36, H - 24
        draw.rounded_rectangle([win_x1, win_y1, win_x2, win_y2], radius=10, fill=(20, 16, 13, 255), outline=(46, 38, 32, 255), width=1)
        draw.rectangle([win_x1, win_y1 + 28, win_x2, win_y2], fill=(16, 13, 11, 255))
        
        # Window control dots
        draw.ellipse([win_x1 + 14, win_y1 + 10, win_x1 + 22, win_y1 + 18], fill=(139, 30, 45, 220))
        draw.ellipse([win_x1 + 28, win_y1 + 10, win_x1 + 36, win_y1 + 18], fill=(212, 175, 55, 220))
        draw.ellipse([win_x1 + 42, win_y1 + 10, win_x1 + 50, win_y1 + 18], fill=(74, 107, 83, 220))
        
        # Address bar
        draw.rounded_rectangle([win_x1 + 65, win_y1 + 7, win_x2 - 20, win_y1 + 21], radius=4, fill=(28, 23, 19, 255))
        draw.text((win_x1 + 75, win_y1 + 8), f"https://antoniusjairus.in/projects/{p['title'].lower().replace('.ai', '').replace(' ', '-')}", fill=(120, 108, 98), font=font_tags)
        
        content_w = (win_x2 - win_x1) - 2
        content_h = (win_y2 - (win_y1 + 28)) - 2
        
        if os.path.exists(p['screenshot']):
            raw_shot = Image.open(p['screenshot']).convert('RGBA')
            scale = max(content_w / raw_shot.width, content_h / raw_shot.height)
            new_w, new_h = int(raw_shot.width * scale), int(raw_shot.height * scale)
            shot_scaled = raw_shot.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            left = (new_w - content_w) // 2
            top = (new_h - content_h) // 2
            shot_cropped = shot_scaled.crop((left, top, left + content_w, top + content_h))
            
            im.paste(shot_cropped, (win_x1 + 1, win_y1 + 29))
            
        out_path = os.path.join(PROJ_DIR, p['file'])
        im.save(out_path, format='PNG', optimize=True)
        print(f"Project banner saved: {out_path} ({os.path.getsize(out_path) / 1024:.1f} KB)")

if __name__ == '__main__':
    render_hero_animation()
    render_separator_animation()
    generate_project_banners()
    print("ALL ASSETS BUILT SUCCESSFULLY!")

