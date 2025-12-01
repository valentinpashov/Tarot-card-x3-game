Tarot card x3 game:
A fully responsive, casino-style Tarot game built with TypeScript, PixiJS (v8), and GSAP. The game features weighted random outcomes, variable game speeds, auto-play functionality, and a custom 2.5D perspective engine.

🌟 Key Features
2.5D Perspective: Custom implementation of depth using PIXI.MeshPlane and direct vertex buffer manipulation to simulate 3D card flips without heavy 3D engines.

GSAP Animations: Smooth, timeline-based animations for card interactions and UI scaling.

Responsive Design: The game engine listens for resize events and dynamically calculates scaling and positioning for both desktop and mobile layouts.

State Management: Robust state machine pattern (Idle → RoundStart → Reveal → Result) ensures logical stability.

Configurable Math: Win rates and bet options are decoupled from logic, allowing for easy RTP (Return to Player) balancing.

🛠️ Tech Stack
Core: TypeScript

Rendering: PixiJS v8

Animation: GSAP (GreenSock)

Build Tool: Vite / NPM

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

/src
  ├── assets/         # Images and textures
  ├── Game.ts         # Main controller, resizing logic, and UI orchestration
  ├── Card.ts         # Card class: handles MeshPlane perspective and flip animations
  ├── config.ts       # Game balance settings (Pay Table, Bet Options)
  ├── types.ts        # TypeScript interfaces (MultiplierData) and Enums (GameState)
  ├── main.ts         # Entry point and PixiJS Application initialization
  └── style.css       # Canvas layout styling


🔄 State Flow
The game logic follows a state machine pattern.
Idle → RoundStart → Reveal → Result → Idle

Idle: The game is waiting for user interaction.

RoundStart: The player initiates a round. UI is locked, bet is deducted (logically), and card data is generated based on the Pay Table weights.

Reveal: Cards are flipped sequentially. The duration is dynamic based on the selected Game Speed.

Result: The total win amount is calculated (Bet × Multiplier) and displayed.

If Auto-Play is active: The game transitions back to RoundStart automatically after a delay.

If Auto-Play is inactive: The game returns to Idle.


🤖 AI-Assisted Development & Technical Research
Assets & Design: Images were generated with Gemini Nano Banana. I also used Gemini to iterate on the UI button designs.

Functionality Research: I utilized AI to extensively research game mechanics, specifically focusing on GSAP animation timings and weighted random logic for the multipliers.

PixiJS v8 & 3D Perspective:

I conducted broad research on implementing 2.5D perspective (projection) within the latest PixiJS v8, comparing existing libraries like Pixi-Projection against native solutions.

Through this research, I determined that a custom implementation using PIXI.MeshPlane was the most efficient approach for v8.

AI helped me understand how to directly manipulate the vertex data buffers. This allowed me to achieve the table depth and card flip perspective effects without relying on heavy external plugins or legacy dependencies.
    
🔮Future Improvements

1)History of rounds

2)A wider range of bets

3)Some magic cards with positive or negative surprises/bonuses
