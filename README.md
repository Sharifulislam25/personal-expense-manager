# Personal Expense Manager 💰

A minimal, privacy-focused expense tracking web application that runs entirely in your browser. No servers, no accounts — your data stays on your device.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat&logo=chartdotjs&logoColor=white)

## ✨ Features

### Core Features
- **Add Expenses** — Quick form with amount, category, note, and date
- **Edit & Delete** — Modify or remove transactions with confirmation
- **Search & Filter** — Find transactions by text, category, or date range
- **Quick Filters** — One-click filters for Today, This Week, This Month

### Visualization
- **Dashboard Cards** — Today's and monthly spending at a glance
- **Sparkline Chart** — 7-day mini trend visualization
- **Line Chart** — 30-day spending over time
- **Pie Chart** — Spending breakdown by category with percentages

### Data Management
- **LocalStorage** — All data stored locally in your browser
- **CSV Export** — Download your transactions as a CSV file
- **CSV Import** — Upload transactions from a CSV file
- **Trash Bin** — Deleted items kept for 7 days with restore option

### User Experience
- **Light/Dark Mode** — Toggle between themes (auto-detects system preference)
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Keyboard Shortcuts** — Press Enter to add quickly, Escape to close modals
- **Toast Notifications** — Feedback for all actions
- **Onboarding Screen** — Welcome guide for first-time users

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| **HTML5** | Page structure and semantic markup |
| **CSS3** | Styling with CSS variables for theming |
| **JavaScript (ES6+)** | Application logic and interactivity |
| **Chart.js** | Data visualization (line, pie, sparkline charts) |
| **LocalStorage API** | Client-side data persistence |
| **Google Fonts** | Inter font family for typography |

## 📁 Project Structure

```
Personal Expense Manager/
├── index.html      # Main HTML file with app structure
├── styles.css      # All CSS styles with light/dark themes
├── app.js          # JavaScript application logic
└── README.md       # This documentation file
```

## 🚀 How to Use

### Getting Started

1. **Download or Clone** the project files
2. **Open `index.html`** in any modern web browser
3. **Click "Start tracking"** on the welcome screen
4. **Add your first expense** using the Quick Add form

### Adding an Expense

1. Enter the **amount** (e.g., 150.50)
2. Select a **category** (Food, Transport, Shopping, etc.)
3. Add an optional **note** (e.g., "Lunch at cafe")
4. Pick a **date** (defaults to today)
5. Click **Add** or press **Enter**

### Managing Transactions

- **Edit**: Click the pencil icon on any transaction
- **Delete**: Click the trash icon (moves to Trash)
- **Search**: Type in the search box to filter
- **Filter**: Use category dropdown or date pickers
- **Quick Filter**: Click Today/This Week/This Month buttons

### Using the Trash

- Deleted items go to **Trash** (not permanently deleted)
- Items auto-delete after **7 days**
- **Select items** using checkboxes
- **Restore Selected** — Bring items back to Expenses
- **Delete Selected** — Permanently remove selected items
- **Empty Trash** — Clear all trash items at once

### Exporting/Importing Data

**Export:**
1. Click **Export CSV** button
2. A CSV file downloads with all your transactions

**Import:**
1. Click **Import CSV** button
2. Select a CSV file with columns: Date, Category, Amount, Note
3. Transactions are added to your list

### Changing Theme

- Click the **sun/moon icon** in the header
- Toggles between Light and Dark mode
- Your preference is saved automatically

## 💾 Data Storage

All data is stored in your browser's LocalStorage:

| Key | Description |
|-----|-------------|
| `pem_tx_v1` | Active transactions |
| `pem_trash_v1` | Deleted items (7-day retention) |
| `pem_theme` | Theme preference (light/dark) |
| `pem_onboarding_done` | Onboarding completion flag |

### Data Privacy

- ✅ Data **never leaves your device**
- ✅ **No accounts** or registration required
- ✅ **No servers** or cloud storage
- ✅ **No tracking** or analytics
- ⚠️ Clearing browser data will delete your expenses

## 🎨 Categories

The app includes 8 expense categories:

| Category | Color |
|----------|-------|
| 🍔 Food | Orange |
| 🚗 Transport | Blue |
| 🛍️ Shopping | Pink |
| 📄 Bills | Purple |
| 🎬 Entertainment | Green |
| 🏥 Health | Red |
| 📚 Education | Cyan |
| 📦 General | Indigo |

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Add expense (when in amount field) |
| `Escape` | Close any open modal |
| `Tab` | Navigate between form fields |

## 🌐 Browser Support

Works on all modern browsers:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

## 📝 CSV Format

For importing, use this CSV format:

```csv
Date,Category,Amount,Note
2024-12-12,Food,150.50,Lunch at restaurant
2024-12-11,Transport,50.00,Bus fare
2024-12-10,Shopping,500.00,"New shoes"
```

## 📄 License

This project is open source and available for personal use.

---

**Made with ❤️ for simple, private expense tracking**
