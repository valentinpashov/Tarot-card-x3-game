1: Tarot card x3 game:

A fully responsive, Tarot-card x3 style game built with **TypeScript**, **PixiJS**, and **GSAP**. The game features weighted random outcomes, variable game speeds, auto-play functionality, and a betting system.

2: How to Run:

Ensure you have Node.js installed. You can use `npm`.

3: Install Dependencies
```bash
    npm install

    2. Run Development Serve
    npm run dev

    3. Build
    npm run build


4: State Flow
The game logic follows a state machine pattern.
Idle → RoundStart → Reveal → Result → Idle

    Idle: The game is waiting for user interaction.

    RoundStart: The player initiates a round. UI is locked, bet is deducted (logically), and card data is generated based on the Pay Table weights.

    Reveal: Cards are flipped sequentially. The duration is dynamic based on the selected Game Speed.

    Result: The total win amount is calculated (Bet × Multiplier) and displayed.

        If Auto-Play is active: The game transitions back to RoundStart automatically after a delay.

        If Auto-Play is inactive: The game returns to Idle.


Using AI tools:
Images were generated with Gemini Nano Banana.
I used Gemini to help me with button design
I asked AI about some function logic, gsap, multipliers.
    



I think good ideas for the future are:
History of rounds
A wider range of bets
Some magic cards with positive or negative surprises/bonuses