# Dome Process Analyzer — Demo Guide

How to start, stop, and run the app locally for a demo.

---

## Prerequisites

Both servers must be running at the same time. You need **two terminal windows** open side by side.

- **Terminal 1** → Backend (FastAPI)
- **Terminal 2** → Frontend (Next.js)

---

## Starting the Servers

### Terminal 1 — Backend

```bash
cd ~/Documents/Business/Dome/Dome\ Process\ Analyzer/dome-process-analyzer/backend
source venv/bin/activate
python3 -m uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

### Terminal 2 — Frontend

```bash
cd ~/Documents/Business/Dome/Dome\ Process\ Analyzer/dome-process-analyzer/frontend
./node_modules/.bin/next dev
```

You should see:
```
▲ Next.js 14.x.x
- Local: http://localhost:3000
✓ Ready in Xs
```

The app is now accessible at **http://localhost:3000**

---

## Stopping the Servers

In each terminal window, press **Ctrl + C**.

---

## Restarting After a Break

1. Stop both servers (Ctrl + C in each terminal)
2. Follow the **Starting the Servers** steps above
3. No need to reinstall dependencies unless you've pulled new code

---

## What Each Server Does

| Server | URL | Purpose |
|--------|-----|---------|
| Backend | http://localhost:8000 | FastAPI — runs the AI analysis, talks to Supabase |
| Frontend | http://localhost:3000 | Next.js — the UI you show in demos |

The frontend calls the backend directly (bypassing the Next.js proxy) because the AI analysis takes ~40 seconds, which exceeds the proxy's timeout. This is configured in `frontend/.env.local`.

---

## Demo Flow

1. Open **http://localhost:3000**
2. Paste a business process description (minimum 50 characters)
3. Optionally add a process name and domain hint (click **+ Optional fields**)
4. Click **Analyse process** and wait ~40 seconds
5. Review: metrics, steps, systems map, governance flags, automation opportunities, flowchart
6. If clarifying questions appear, answer them and click **Refine analysis** for an updated analysis
7. To save: click **Save analysis** (requires sign-in via magic link email)
8. Saved analyses appear under **Saved** in the top navigation

---

## Example Process Description

Paste this to demonstrate a typical analysis:

```
Our employee onboarding process starts when HR receives a signed offer letter.
HR manually enters the new hire details into the HRIS system (Workday) and sends
a welcome email via Outlook. IT then creates accounts in Active Directory, Office 365,
and Slack, but they only find out the new hire is starting when HR sends them an
email two days before the start date. On the first day, the manager fills out a
paper form to request laptop provisioning, which Facilities processes within 3-5
days. Meanwhile, the new hire has no computer. Payroll is notified separately via
a shared Excel sheet on SharePoint that Finance and HR both edit. There is no
formal checklist and tasks are frequently missed, requiring follow-up emails.
```

This description demonstrates: manual handoffs, shadow IT risk (shared Excel), bottlenecks (laptop delay), and multiple automation opportunities.

---

## Troubleshooting

**"command not found" for uvicorn**
→ Use `python3 -m uvicorn` (not `uvicorn` directly)

**"command not found" for next**
→ Use `./node_modules/.bin/next dev` (not `npx next dev`)

**Analysis fails or times out in the browser**
→ Check that the backend (Terminal 1) is running and showing no errors
→ The analysis legitimately takes 35–45 seconds — this is normal

**"Failed to send magic link" error**
→ The Supabase project may be paused — log in at supabase.com and unpause it
→ The health endpoint at http://localhost:8000/api/v1/health will now show Supabase status

**Magic link email arrives but the analysis is gone after clicking it**
→ Expected: the magic link only signs you in, it does not restore previous work
→ Re-submit your analysis, then click Save (you are now signed in — no redirect needed)

---

## Supabase Keep-Alive

The free Supabase tier pauses after 7 days of zero database activity.

A **Claude Code scheduled task** (`supabase-keepalive`) is already set up to ping the Supabase REST API every 4 days. It runs automatically at 9:00 AM as long as Claude Code is active on your machine.

You can view and manage it in the **Scheduled** section of the Claude Code sidebar.

> Once the backend is deployed to a public URL, add an UptimeRobot monitor pointing at `https://your-domain/api/v1/health` for continuous monitoring independent of your local machine. The `/health` endpoint runs a lightweight Supabase query, so each ping counts as database activity.
