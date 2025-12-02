Tarot card x3 game:
A fully responsive, casino-style Tarot game built with **TypeScript**, **PixiJS (v7)**, and **GSAP**. The game features weighted random outcomes, variable game speeds, auto-play functionality, and a dedicated 3D camera system for realistic depth and perspective.

🌟 Key Features

* **True 3D Perspective:** Utilizes `pixi-projection` with a **Camera3d** setup. The table and cards exist in a 3D coordinate system (x, y, z) with proper Euler rotation, allowing for realistic depth and tilt effects without heavy WebGL engines like Three.js.

* **Smart Z-Sorting:** Dynamic depth sorting ensures cards correctly overlap the table and each other during animations.

* **GSAP Animations:** Smooth, timeline-based animations for 3D card flips (using Euler angles), bounces, and UI scaling.

* **Responsive Design:** The game engine listens for resize events and dynamically recalculates the 3D camera planes, card gaps, and scaling for seamless desktop and mobile experiences.

* **State Management:** Robust state machine pattern (`Idle` → `RoundStart` → `Reveal` → `Result`) ensures logical stability.

* **Configurable Math:** Win rates and bet options are decoupled from logic, allowing for easy RTP (Return to Player) balancing via configuration files.

🛠️ Tech Stack*
**Core:** TypeScript

* **Rendering:** PixiJS v7.x (Selected for stable 3D projection support)

* **3D Engine:** pixi-projection v1.0.0

* **Animation:** GSAP (GreenSock)

* **Build Tool:** Vite / NPM

🚀 How to Run:
Ensure you have Node.js installed. You can use `npm`.

1: Install Dependencies
    
    1.Installation
    npm install

    2. Run Development Serve
    npm run dev

    3. Build
    npm run build

    
⚙️ Configuration & Math
The game balance is data-driven and fully configurable via src/config.ts.

Weighted RNG: The outcome logic uses a weighted probability system. Each card value has a specific chance percentage defined in the PAY_TABLE array.

Betting Strategy: Available bet amounts are controlled via the BET_OPTIONS array.

📂 Project Structure:
```text
tarot-game/
├── node_modules/       # Dependencies installed by npm
├── src/
│   ├── assets/         # Game assets (images, textures, sprites)
│   ├── Card.ts         # Handles 3D card logic, interactions & animations
│   ├── config.ts       # Configuration: Pay Table, Bet Options, Probabilities
│   ├── Game.ts         # Core Game Engine: Camera3d, World, Resize Logic
│   ├── main.ts         # Application Entry Point & PixiJS Initialization
│   ├── style.css       # CSS for the canvas container
│   └── types.ts        # TypeScript definitions (Enums, Interfaces)
├── index.html          # Main HTML entry file
├── package.json        # Project metadata & dependencies
├── tsconfig.json       # TypeScript compiler options
└── vite.config.ts      # Vite build configuration
```

🔄 State Flow
The game logic follows a state machine pattern.
Idle → RoundStart → Reveal → Result → Idle

Idle: The game is waiting for user interaction.

RoundStart: The player initiates a round. UI is locked, bet is deducted, and card data is generated based on the Pay Table weights.

Reveal: Reveal: Cards are flipped sequentially using 3D rotation logic. The duration is dynamic based on the selected GameSpeed (Normal, Fast, Instant).

Result: The total win amount is calculated (Bet × Multiplier) and displayed.

Auto-Play Logic: If active, the game transitions back to RoundStart automatically; otherwise, it returns to Idle.


🤖 AI-Assisted Development & Technical Research
Assets & Design: Base imagery generated with Gemini Nano Banana. UI button designs were iterated upon using AI assistance.

Functionality Research: I utilized AI to extensively research game mechanics, specifically focusing on GSAP animation timings and weighted random logic for the multipliers.

We migrated the codebase to PixiJS v7 to leverage the mature pixi-projection library. This allowed us to implement a proper Camera3d class, enabling real 3D positioning (Z-axis) and simplified rotation logic, resulting in a much more polished visual experience.

    
🔮Future Improvements

1)History of rounds

2)A wider range of bets

3)Some magic cards with positive or negative surprises/bonuses
