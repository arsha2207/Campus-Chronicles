# Campus Chronicle — React Project Structure

```
campus-chronicle/
├── public/
│   └── index.html
├── src/
│   ├── main.jsx                    ← React entry point
│   ├── App.jsx                     ← Root: routing + user state
│   │
│   ├── data/
│   │   └── demoData.js             ← All demo articles, users, notifications
│   │
│   ├── utils/
│   │   ├── constants.js            ← Category colours, API base URL
│   │   └── api.js                  ← All Flask API calls in one place
│   │
│   ├── hooks/
│   │   └── useToast.jsx            ← Reusable toast notification hook
│   │
│   ├── styles/
│   │   └── global.css              ← Global CSS: keyframes, scrollbar, body
│   │
│   ├── components/                 ← Reusable UI atoms & layout pieces
│   │   ├── Badge.jsx               ← Coloured category badge
│   │   ├── Buttons.jsx             ← Btn, TbBtn, Sbtn, RdBtn
│   │   ├── FormElements.jsx        ← FLabel, FInput, FSel
│   │   ├── Masthead.jsx            ← Newspaper header + nav
│   │   ├── Ticker.jsx              ← Breaking news scrolling bar
│   │   ├── TopBar.jsx              ← Top utility bar (user, logout, time)
│   │   └── SecRule.jsx             ← Section divider rule
│   │
│   └── pages/                      ← One file per full page
│       ├── LoginPage.jsx
│       ├── RegisterPage.jsx
│       ├── HomePage.jsx
│       ├── SubmitPage.jsx
│       ├── AdminPage.jsx
│       ├── NotificationsPage.jsx
│       └── SearchPage.jsx
│
├── package.json
└── vite.config.js
```
