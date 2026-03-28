# FixFirst

FixFirst is a citizen-first civic tech web app for reporting, tracking, and prioritizing road and infrastructure issues. It is built as a lightweight static frontend using HTML, CSS, and vanilla JavaScript, with role-based flows for both citizens and municipal authorities.

The platform is designed to make issue reporting more actionable by combining precise location capture, photo evidence, duplicate detection, and community upvoting in a simple browser-based experience.


## Overview

FixFirst helps bridge the gap between citizens and local authorities by making public issue resolution more transparent and easier to manage.

Citizens can:

- report road and civic issues
- capture live photo evidence
- pick or auto-detect issue location
- view issues on a map
- upvote existing reports to raise priority
- track the status of their own reports

Authorities can:

- review all submitted issues
- see issues grouped by status
- prioritize work using community upvotes
- update issue progress from `on-deck` to `in-progress` to `resolved`
- upload resolution photos as proof of completion

## Key Features

### Smart Issue Reporting

- Report issues such as potholes, road cracks, open manholes, broken dividers, damaged roads, and street light problems.
- Capture visual proof directly from the device camera.
- Store issue severity, description, and location details.

### GPS and Map Support

- Location can be selected manually from an interactive map.
- Device geolocation can be used to capture the current position.
- All reported issues can be viewed on a Leaflet-powered map.

### Duplicate Detection

- The app checks for nearby duplicate issues within a 50 meter radius.
- This helps reduce repeated reports for the same problem and keeps attention focused on verified cases.

### Community Prioritization

- Citizens can upvote issues already reported in their area.
- Authority-facing views sort issues by upvotes, helping surface the most urgent community concerns first.

### Role-Based Experience

- `Citizen Dashboard`: submit reports, view personal reports, and track progress.
- `Authority Dashboard`: manage issue pipelines and resolution workflows.

### Resolution Tracking

- Issue lifecycle includes:
  - `on-deck`
  - `in-progress`
  - `resolved`
- Authorities can attach a post-resolution image before closing an issue.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- [Leaflet](https://leafletjs.com/) for maps
- OpenStreetMap tiles for map rendering

## Project Structure

```text
FixFirst/
├── index.html
├── README.md
├── assets/
│   └── logo.png
├── css/
│   └── style.css
└── js/
    ├── app.js
    ├── auth.js
    ├── authority.js
    ├── citizen.js
    ├── data.js
    ├── map.js
    └── utils.js
```

## How to Run

This project does not require a build step or package installation.

1. Clone or download the repository.
2. Open `index.html` in a modern browser.

For the best experience, use a local static server so that camera and geolocation features behave more reliably in the browser.

Example:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Demo Credentials

Use the built-in demo accounts to explore both user roles:

### Citizen

- Email: `citizen@demo.com`
- Password: `demo`

### Authority

- Email: `admin@demo.com`
- Password: `admin`

## Current Data Model

The project currently uses in-memory demo data defined in [`js/data.js`](/Users/roshankumarjha/Desktop/FixFirst/js/data.js). No backend or database setup is required.

Data includes:

- demo users
- issue records
- status transitions
- upvotes
- timestamps
- uploaded image data stored in memory during runtime

## Notes

- This is a frontend demo/prototype project.
- Data is not persisted across page reloads.
- Camera and geolocation access depend on browser permissions and may work best on secure or local served origins.

## Use Cases

- Smart city prototypes
- civic reporting demos
- hackathon submissions
- municipal workflow concepts
- community issue tracking experiments

## Contributors

- Roshan Jha — `roshanjha1007@gmail.com`

- Yash Kulshrestha — `yashkulshrestha76@gmail.com`

- Rohit Jha - `rohitpay1008@gmail.com`

## License

This project is intended for educational and demonstration purposes.
