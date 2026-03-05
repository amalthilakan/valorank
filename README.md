# 🎮 Valorank

**Valorank** is a lightweight web application that generates a
**Valorant rank overlay card** displaying **Rank, RR (Rank Rating), and
progression**.

It is designed to be used as a **stream overlay for OBS and other
streaming software**, allowing streamers to display their **current
competitive rank visually during gameplay**.

<p align="center"> <a href="https://valorank-delta.vercel.app/">🌐 Live Demo</a> • <a href="https://github.com/amalthilakan/valorank">📂 Repository</a> </p>

------------------------------------------------------------------------

# ✨ Features

-   🎮 **Streamer-Friendly Overlay** -- Designed for OBS and streaming
    software\
-   🏆 **Rank Display** -- Shows the current Valorant competitive rank\
-   📊 **RR Display** -- Displays Rank Rating (RR)\
-   📈 **Progress Bar** -- Visualizes progression toward the next rank\
-   🎨 **Clean Rank Card UI** -- Minimal design suitable for stream
    overlays\
-   ⚡ **Fast & Lightweight**

------------------------------------------------------------------------

# 🖥️ Tech Stack

## Frontend

-   Next.js
-   React
-   CSS

## Deployment

-   Vercel

------------------------------------------------------------------------

# 🚀 Live Demo

https://valorank-delta.vercel.app/

------------------------------------------------------------------------

# 📦 Installation

Clone the repository:

``` bash
git clone https://github.com/amalthilakan/valorank.git
```

Navigate into the project directory:

``` bash
cd valorank
```

Install dependencies:

``` bash
npm install
```

Run the development server:

``` bash
npm run dev
```

Open your browser:

    http://localhost:3000

------------------------------------------------------------------------

# 📡 Using as an OBS Overlay

1.  Open the overlay generator\
    https://valorank-delta.vercel.app/

2.  Enter:

    -   Riot ID
    -   Tag
    -   Region

3.  Generate the overlay link

4.  Copy the generated link

5.  In **OBS Studio**

```{=html}
<!-- -->
```
    Sources → Add → Browser Source

6.  Paste the generated overlay URL

Example settings:

    Width: 800
    Height: 300

The overlay will now appear in your **stream layout**.

------------------------------------------------------------------------

# 🚀 Deployment

The project is deployed on **Vercel**.

Live version:

https://valorank-delta.vercel.app/

------------------------------------------------------------------------

# 🔮 Future Improvements

-   Riot API integration
-   Automatic rank detection
-   Animated rank transitions
-   Match stats display
-   Export overlay as image
-   Custom themes

------------------------------------------------------------------------

# 👨‍💻 Author

**Amal Thilakan**\
GitHub: https://github.com/amalthilakan
