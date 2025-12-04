GLUTTON4GAMES – Design System Specification

1. Visual Theme

Vibe: Tactical, Military, Aggressive, "Dark Mode Only".
Reference Assets: IMG_4444.PNG (Badge Gallery), G4G_Logo_2.png (Gorilla).

2. Color Palette

Background (Camo Black): #0a0a0a (Main background - deep black).

Surface (Gunmetal): #1a1a1a (Cards, Modals, Inputs).

Primary Accent (Tactical Red): #D32F2F (Taken from G4G Logo Red). Use for Buttons, Active States, Borders.

Secondary Accent (Steel): #4a4a4a (Borders, Dividers, Inactive Icons).

Text (High Vis): #FFFFFF (Headings, Primary Data).

Text (Muted): #A3A3A3 (Body text, Labels).

Success (Radar Green): #10B981 (Completed missions, Rank up).

3. Typography

Headings (Military Stencil): Oswald or Black Ops One (Google Fonts). Uppercase, Bold.

Body: Inter or Roboto (Clean, legible, tabular data friendly).

4. UI Components

A. The "Mission Card" (Workout)

Texture: Background should have a subtle repeating pattern (carbon fiber or diamond plate) if possible, or a flat dark grey.

Borders: 1px solid Red (#D32F2F) on the active card.

Corner Radius: Slightly rounded rounded-md (4px) or chamfered/angled corners (clip-path) for a tactical look.

B. Badge Grid (Ref: IMG_4444.PNG)

Layout: 2-column grid.

Background: The uploaded reference uses a "diamond plate" metal texture. Try to replicate this with CSS or a repeating SVG pattern.

Icon: Star icon inside a circle.

State:

Locked: Opacity 50%, Greyscale.

Unlocked: Full Color (Red/Silver), Glow effect.

C. Progress Bars (XP & Stats)

Style: Flat, sharp edges. No soft pills.

Color: Red fill on a dark grey track.

D. Navigation

Mobile: Bottom sticky bar.

Icons:

Target/Crosshair: Home (Missions)

Fork/Knife: Nutrition

Bar Chart: Stats

Shield/Badge: Profile
