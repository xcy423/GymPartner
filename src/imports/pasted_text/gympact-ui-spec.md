import os

os.makedirs(os.path.expanduser('~/output'), exist_ok=True)

prompt = """
You are building a mobile-first web app called **GymPact** — a private gym accountability and reward system for two people (a couple). Build the complete UI across all 4 screens with full interactivity.

---

## PERSONALITY & AESTHETIC

This is a **cute, modern, warm lifestyle app** — NOT a tech dashboard, NOT a SaaS product, NOT an AI tool.
Think: wellness habit tracker meets couple motivation app meets cute reward journal.

Visual feel:
- Clean white #FFFFFF base background
- Soft pastel-tinted cards and surfaces
- Warm gold accents for anything reward or points related
- Cool blue accents for actions and progress
- Soft, rounded, airy — never sharp or corporate
- Small emoji accents are welcome (💪 🎯 🔥 ✨ 💌 🍳 ⭐)
- Friendly copy tone — e.g. "Let's get moving! 💪" not "Start session"

---

## DESIGN TOKENS

### Colors (use these exact values)

Primary blue:        #6EA4BB   → buttons, active nav, progress bars, focus rings
Primary dark:        #4E8BA3   → hover states
Primary tint:        #6EA4BB at 12% opacity → highlighted backgrounds
Primary border:      #6EA4BB at 35% opacity → card borders when active

Gold:                #D4A843   → points, rewards, multiplier values
Gold dark:           #B88E2F   → gold hover/text
Gold tint:           #D4A843 at 12% opacity → reward card backgrounds
Gold border:         #D4A843 at 35% opacity

Red:                 #C04C4B   → errors, danger
Red tint:            #C04C4B at 10% opacity

Green:               #5A9E6E   → completed sessions, success
Green tint:          #5A9E6E at 12% opacity
Green border:        #5A9E6E at 30% opacity

Warn:                #D4854A   → partial sessions, reminders
Warn tint:           #D4854A at 12% opacity

Background:          #FFFFFF
Surface:             #FFFFFF
Surface-2:           #F3F4F8   → stat boxes, step card backgrounds, input backgrounds
Surface-3:           #ECEEF5   → progress bar tracks, photo placeholder

Text primary:        #2A2D35
Text muted:          #6B7280
Text faint:          #B0B8C8
Text inverse:        #FFFFFF   → text on filled primary button

### Spacing (use only these values)
4px · 6px · 8px · 12px · 16px · 24px · 32px · 48px

### Border radius (use only these values)
4px · 6px · 8px · 12px · 16px · 999px(pill)

---

## TYPOGRAPHY

Font: Inter (Google Fonts)

| Use               | Size  | Weight | Letter spacing |
|-------------------|-------|--------|----------------|
| Hero title        | 28px  | 900    | -0.05em        |
| Section heading   | 18px  | 800    | -0.03em        |
| Card title        | 15px  | 800    | -0.02em        |
| Body / card copy  | 14px  | 400    | 0              |
| Label / eyebrow   | 11px  | 700    | +0.05em        |
| Stat value        | 22px  | 900    | -0.04em        |
| Chip/tag text     | 11px  | 700    | +0.04em        |

---

## LAYOUT

- Max width: 440px, centered
- Screen padding: 16px horizontal
- Bottom padding: 80px (nav clearance)
- Floating bottom pill nav

---

## ACCOUNTS

Two users only. No admin login screens.

| Username | Password | Partner  | Approval code |
|----------|----------|----------|---------------|
| codee    | gym123   | owen     | love2026      |
| owen     | gym456   | codee    | pact2026      |

Both users can:
- Log their own gym sessions
- View partner's progress (read-only)
- Approve partner's reward requests using their own approval code

---

## SCREEN 1 — LOGIN

Layout: centered card on soft background (#F8F8FB)

Card contains:
- Big emoji logo mark: 🏋️ in a 52×52px rounded square (16px radius), gradient fill from Primary tint to Gold tint, Primary border 1px
- App name: "GymPact" — Hero title weight
- Subtitle: "Your private gym accountability & rewards app ✨" — muted text
- Username input field (label: USERNAME, placeholder: "codee or owen")
- Password input field (label: PASSWORD, placeholder: "Your password")
- Primary blue button full width: "Sign in →"
- Soft hint box below button: "Demo: codee / gym123 · owen / gym456"

Input fields:
- Height 50px, radius 6px
- Background Surface-2
- Border 1.5px Primary at 20%
- On focus: border becomes full Primary + 4px outer glow in Primary tint

---

## SCREEN 2 — HOME (My Progress mode)

### Topbar (sticky)
- Left: 🏋️ logo mark (34px, radius 8px) + "GymPact" bold + subtitle showing "[Name] · [X] pts"
- Right: theme toggle icon button (circular, 36px)
- Background: white 80% + blur 18px
- Bottom border: 1px Divider

### Partner view banner (hidden by default)
- Full-width warm gold pill banner: "👀 Viewing [partner name]'s progress"
- Background Gold tint, border Gold border
- Only visible when Partner View mode is active

### Hero card
- Radius 12px, gradient from Primary 8% tint to white, Primary border 1px, Shadow/MD
- Padding 24px
- Eyebrow pill chip: "This week · 2 / 3" (Primary tint bg, Primary text, pill shape)
- Hero title: dynamic message e.g. "1 more session to go! 💪"
- Body copy: "Hit 3 sessions/week = 100 pts · Hit 5 sessions = 250 pts · Streak multiplier grows each week"

### Weekly progress bar
- Below hero copy, inside hero card
- Header row: "Weekly sessions" left · "2 / 5" right (muted small text)
- Track: 10px tall, Surface-3 background, radius 999px
- Fill: gradient from Primary → mix of Primary+Gold, radius 999px
- Below bar: 6 milestone markers evenly spaced (0, 1, 2, 3🎯, 4, 5⭐)
  - Marker dot 8px circle, filled Primary or Gold when hit, Surface-3 when not
  - Label below each dot in tiny bold text
  - At 3: label "3 🎯" in Primary color when hit
  - At 5: label "5 ⭐" in Gold when hit

### Reminder banner (shown only if no session today)
- Below hero card
- Warn tint background, Warn border, Warn text
- Icon (⚠ triangle) + text: bold "Hey, are you tracking? 👋" + "No session logged today."

### Stats row (2×2 grid)
- 4 equal cards in a 2-column grid, gap 12px
- Each card: Surface-2 bg, radius 8px, border, padding 12px
- Card 1: label "Points" · value in Gold color (e.g. 240)
- Card 2: label "Multiplier" · value in Primary color (e.g. ×1.2)
- Card 3: label "Week streak" · value in Green (e.g. 2 wks)
- Card 4: label "Sessions / month" · plain text value (e.g. 6)

### Streak explainer card
- Separate card below stats, Surface-2 bg, radius 12px, border
- Title: "🔥 How streak multiplier works" — card title weight
- Body: "Complete 3+ sessions every week to grow your multiplier. Each successful week = +×0.2 bonus, capped at ×3.0. Miss a week and it resets to ×1.0 — but your points stay!"
- Below text: horizontal scrollable multiplier ladder
  - 11 bubbles: ×1.0, ×1.2, ×1.4, ×1.6, ×1.8, ×2.0, ×2.2, ×2.4, ×2.6, ×2.8, ×3.0
  - Each bubble: 40×40px, radius 8px, Text/XS-Bold
  - State — past/done: Green tint bg, Green border, Green text
  - State — current: Primary tint bg, Primary border, Primary text, scale 1.12x, soft blue shadow
  - State — future: Surface bg, border, faint text
  - State — ×3.0 cap: Gold tint bg, Gold border, Gold text

### Session action area (hidden in Partner View)
- Section heading row: "Today's session" left · status chip right
  - Chip states: "No session" grey · "In progress · Xm" blue · "Ready to check out ✓" green

#### Step 1 — Check-in card (always visible)
- Radius 8px card, Surface-2 bg
- Active state: Primary tint bg, Primary border 1.5px
- Header: step number badge (28px circle, Primary tint, Primary border, "1") + title "Check-in photo 📸" + subtitle "Selfie or gym equipment to prove you're there."
- Photo preview area: 16:9 ratio, Surface-3 bg, dashed border, radius 8px, centered placeholder "📷 Upload check-in"
  - When image uploaded: shows the image filling the area
- Upload trigger: dashed blue button row "↑ Choose photo" (full width, 6px radius, dashed Primary border, Primary text)
- Hidden file input attached to it
- Primary button full width: "Check in now ✓"
- Small note text below: "No check-in yet today." → updates after check-in to time

#### Step 2 — Check-out card (COMPLETELY HIDDEN until check-in is done)
- After check-in: reveal with smooth fade+slide animation
- Radius 8px, active state with Primary tint + border
- Header: step badge "2" + title "Check-out photo 📸" + subtitle "Required after at least 1 hour"
- Timer progress bar:
  - Label row: "Time in gym" left · "0 / 60 min" right (updates live)
  - Track: 6px, Surface-3, radius 999px
  - Fill: gradient Primary → Green, updates every 30 seconds
- Photo preview (same as check-in)
- Upload trigger + file input
- Primary button: "Complete session 🎉"
- Note: "X minutes remaining — keep going! 💪" → changes to "Upload your check-out photo and finish!" when 1h reached

---

## SCREEN 3 — REWARDS

### Section heading
"Rewards 🎁" heading + "Earn points by hitting your weekly gym goals." muted

### 3 Reward cards (stacked, gap 16px)

Each reward card:
- Radius 12px, white bg, border, Shadow/SM
- Unlocked state: Gold border 1px, gradient Gold tint → white

Card layout:
- Top row: emoji icon (44×44px, radius 8px, Gold tint bg, Gold border) + name + desc + cost (big Gold number, "pts" small muted below)
- Progress row: "240 / 200 pts" left · "100%" right — both XS muted
- Progress bar: 6px, Gold gradient fill, shows % progress toward cost
- Footer: action area

Action states:
- Locked: grey secondary button disabled "Need X more pts", opacity 45%
- Unlocked: Gold button full width "Request this reward ✨"
- Pending: warm orange pill "⏳ Awaiting approval from [partner name]…"

Reward 1: 💌 "Handwritten letter" · "A heartfelt letter or cute small surprise gift." · 200 pts
Reward 2: 🍳 "Home-cooked meal" · "Pick your favourite dish and I'll cook it just for you." · 1,000 pts
Reward 3: ⭐ "Your custom wish" · "Name literally anything you want as your reward." · 2,000 pts

### Approval card (shown when partner has a pending reward request)
- Radius 16px card
- Gradient: Primary tint → white, Primary border 1.5px
- Title: "✅ Approve partner reward" — card title weight
- Desc: "[Partner name] wants to redeem [emoji name] for [X] pts. Enter your approval code to confirm."
- Approval code password input (full width, label "YOUR APPROVAL CODE")
- Primary button: "Approve & redeem ✨"
- Small note below: updates after approval to show confirmation date

---

## SCREEN 4 — CALENDAR

### Section heading
Month + year as heading (e.g. "June 2026") + "Your gym session history." muted

### Calendar card
- Radius 12px, white bg, border, padding 16px
- 7-column grid, gap 8px
- Header row: Mo Tu We Th Fr Sa Su — XS bold all-caps muted
- Each day cell: aspect-ratio 1:1, radius 8px, Surface-2 bg, border transparent

Day states:
- Empty: transparent bg, no border
- Partial session: Warn tint bg + Warn text + warn border 25%
- Complete session: Green tint bg + Green text + Green border
- Today: dashed Primary border ring 1.5px inset 3px

Legend row below grid: 3 items — dot + label
- Green dot "Full session" · Orange dot "Partial" · Blue dashed ring "Today"

### Session history list (below calendar)
"Session history" heading

Each session card:
- Radius 12px, white bg, border, padding 16px
- Top row: title ("✅ Complete session" or "⏳ Partial session") left · status chip right
- Date in muted XS below title
- Times row: "In: 9:00 AM" left · "Out: 10:30 AM" right · "90 min" right — all XS muted tabular-nums
- 2-column thumbnail grid (gap 12px):
  - Each thumb: 4:3 ratio, radius 8px, Surface-3 bg, border
  - If image exists: fill the thumb, make it tappable to open fullscreen overlay
  - If no image: centered label "Check-in" or "Check-out" in faint text

---

## SCREEN 5 — SETTINGS

### Section heading
"Settings ⚙️" + "Manage your account."

### Dashboard view toggle card
- Surface-2 bg, radius 8px, border, padding 16px
- Label "DASHBOARD VIEW" eyebrow
- 2-button segmented toggle:
  - Container: Surface-2 bg, radius 8px, border, padding 6px, 2-column grid
  - Each button: min-height 44px, radius 6px, XS bold text
  - Inactive: transparent bg, muted text
  - Active: white bg, Primary text, shadow, border
  - Button 1: "My Progress"
  - Button 2: "Partner View 👀"
- Explanatory text below: "Switch to Partner View to see your partner's streak, sessions and progress. You can also approve their reward requests from the Rewards tab."

### Account settings card
- White bg, radius 8px, border, padding 16px
- Label "ACCOUNT" eyebrow
- Display name input (label "DISPLAY NAME")
- Week mode select (label "WEEK COUNTING", options: "Mon–Sun fixed" / "Rolling 7 days")
- Approval code input password type (label "APPROVAL CODE (for vouchers)")
- Primary button full width: "Save settings"

### Sign out button
- Full width, Danger style (Red tint bg, Red text, Red border)
- Icon + "Sign out"
- Margin top 8px

---

## NAVIGATION

Floating bottom pill nav:
- Position fixed bottom 16px, centered
- Width: calc(100% - 32px), max 420px
- Radius 16px, padding 6px
- Background: white 88% opacity, blur 20px
- Border 1px, Shadow/LG
- 4 tabs in a 2×1 row, each radius 12px, height 52px
- Icon (20px) + label below (11px 700 all-caps)
- Rest: faint text, transparent bg
- Active: Primary tint bg, Primary text

Tabs:
1. 🏠 Home → home screen
2. 🎁 Rewards → rewards screen
3. 📅 Calendar → calendar screen
4. ⚙️ Settings → settings screen

---

## FULLSCREEN PHOTO OVERLAY

- Fixed overlay, black 88% opacity background
- Centered image, max 90vh, radius 12px
- Close button top-right: circular 40px, white 15% bg, white ✕ icon
- Tap outside to close

---

## TOAST NOTIFICATIONS

- Fixed top center, max width 360px
- Radius 12px, shadow
- 3 types:
  - Success (green bg, white text)
  - Error (red bg, white text)
  - Info (Primary blue bg, dark text)
- Fade in from top + scale(0.97→1)
- Auto dismiss after 3.2 seconds

---

## INTERACTIONS & LOGIC

### Check-in / Check-out
- Check-out card is FULLY HIDDEN (display:none) until check-in completes
- After check-in: reveal check-out card with fade + 8px slide-up animation (240ms ease)
- Timer bar updates every 30 seconds after check-in
- After 60 min: timer bar turns green, checkout button turns Primary, note text changes
- After 5 hours: show a warning confirmation

### Points system
- 3 sessions in a week: award 100 pts × multiplier immediately when 3rd session completes
- 5 sessions in a week: award extra 150 pts × multiplier when 5th session completes
- Multiplier grows +0.2 per consecutive successful week, caps at ×3.0
- Missing a week resets multiplier to ×1.0 (points NOT lost)

### Partner view
- All session logging controls hidden
- All stats shown read-only
- Partner banner visible at top

### Reward approval
- Request button only shows when points ≥ reward cost
- After request: card shows pending state
- Partner sees approval card on Rewards tab
- Partner enters their own approval code to approve
- Points deducted immediately on approval
- Toast confirms to both