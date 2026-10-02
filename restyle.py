import re

with open('frontend/src/index.css', 'r') as f:
    content = f.read()

# 1. Update root variables
root_replacements = {
    '--primary: #7c3aed;': '--primary: #FAD9C8;',
    '--primary-dark: #5b21b6;': '--primary-dark: #F3B8C6;',
    '--primary-light: #a78bfa;': '--primary-light: #F3B8C6;',
    '--accent: #f59e0b;': '--accent: #A8BFA3;',
    '--accent-light: #fde68a;': '--accent-light: #e0eadf;',
    '--bg: #0d0d1a;': '--bg: #FFF8F0;',
    '--bg-card: #13132a;': '--bg-card: #FFFFFF;',
    '--bg-card2: #1a1a35;': '--bg-card2: #FFF8F0;',
    '--border: rgba(124, 58, 237, 0.2);': '--border: #EADFD7;',
    '--text: #f1f5f9;': '--text: #493A35;',
    '--text-muted: #94a3b8;': '--text-muted: #806F68;',
    '--text-dim: #64748b;': '--text-dim: #A69B96;',
    '--glass: rgba(255,255,255,0.04);': '--glass: rgba(255, 255, 255, 0.7);',
    '--glass-border: rgba(255,255,255,0.08);': '--glass-border: #EADFD7;',
    '--shadow: 0 25px 60px rgba(0,0,0,0.5);': '--shadow: 0 25px 60px rgba(73, 58, 53, 0.08);',
    '--shadow-sm: 0 4px 20px rgba(0,0,0,0.3);': '--shadow-sm: 0 4px 20px rgba(73, 58, 53, 0.05);'
}
for k, v in root_replacements.items():
    content = content.replace(k, v)

# 2. Hardcoded rgba of primary color (124, 58, 237) -> Peach (250, 217, 200)
content = content.replace('124, 58, 237', '250, 217, 200')
content = content.replace('124,58,237', '250,217,200')

# 3. Text colors hardcoded to white #fff -> text #493A35 where appropriate
content = content.replace('color: #fff;', 'color: #493A35;')
content = content.replace('color: #1a0a00;', 'color: #493A35;')
content = content.replace('border-top-color: #fff;', 'border-top-color: var(--primary);')

# 4. Navbar background (was dark transparent) -> Cream transparent
content = content.replace('rgba(13,13,26,0.85)', 'rgba(255, 248, 240, 0.85)')
content = content.replace('rgba(19, 19, 42, 0.7)', 'rgba(255, 255, 255, 0.8)')

# 5. Some other hardcoded dark rgb
content = content.replace('rgba(255, 255, 255, 0.08)', 'rgba(234, 223, 215, 0.5)') # glass border alternative
content = content.replace('rgba(255, 255, 255, 0.1)', 'rgba(234, 223, 215, 0.8)')
content = content.replace('rgba(255, 255, 255, 0.2)', 'rgba(234, 223, 215, 1)')
content = content.replace('rgba(255, 255, 255, 0.3)', 'rgba(234, 223, 215, 1)')

# 6. Primary text colors in gradient:
content = content.replace('var(--text), var(--primary-light)', 'var(--text), var(--text)')
content = content.replace('var(--primary-light), var(--accent)', 'var(--primary), var(--primary-dark)')
content = content.replace('var(--primary), var(--primary-dark)', 'var(--primary), var(--primary-dark)') # no-op just to see
content = content.replace('#8b5cf6', 'var(--primary-dark)')

with open('frontend/src/index.css', 'w') as f:
    f.write(content)
