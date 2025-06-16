# Support Ticketing System

A customer support ticketing system I built to learn full-stack development. Users can create support tickets, agents can manage them, and admins get full control with audit logging.

## What it does

This is a help desk system where customers can submit support requests and staff can track and resolve them. I wanted to build something that felt like real software you'd actually use at a company.

**Different user types see different things:**
- Customers can only create and see their own tickets
- Support agents can view and work on all tickets
- Admins get everything plus user management and system logs

**Main features:**
- Create and manage support tickets
- Track ticket status (Open -> In Progress -> Resolved)
- Set priority levels and categories
- Assign tickets to specific agents
- Dashboard with stats and recent activity
- Complete audit trail of who changed what and when
- Auto-cleanup of old resolved tickets

I tried to make it feel professional - the kind of thing you might actually deploy for a small business.

## Tech Stack

**Frontend:** React with Context API for state management, Tailwind for styling
**Backend:** Node.js + Express
**Database:** PostgreSQL with Sequelize ORM

I chose React because I wanted to continue to practice modern hooks and context patterns. PostgreSQL because I wanted to work with a different database instead of just JSON files or something simple.

## Running it locally

You'll need Node.js and PostgreSQL installed.

```bash
# Clone and install
git clone https://github.com/yourusername/ticketing-system.git
cd ticketing-system
npm install
cd client && npm install && cd ..

# Set up database
createdb ticketing_system

# Start everything
npm start                    # Backend on :5000
cd client && npm start       # Frontend on :3000
```

Then visit `http://localhost:5000/api/create-test-users` to create some test accounts.

**Test logins:**
- Admin: `test@example.com` / `password123`
- Agent: `agent@test.com` / `password123`
- Customer: `customer@test.com` / `password123`

Try logging in as different users to see how the permissions work.

The auto-cleanup feature runs every 24 hours to remove old resolved tickets. The audit logging tracks every create/edit/delete action with timestamps and user info.

## Things I learned

- How to properly structure a React app with context instead of prop drilling
- Setting up role-based permissions (customers vs agents vs admins)
- Database relationships and foreign keys with Sequelize
- Building a REST API that actually makes sense
- Why audit logging is important (and how to implement it)

The hardest part was probably getting the permissions right - making sure customers can only see their own tickets while agents can see everything.

This was a learning project, so there are definitely things I'd do differently in production (better error handling, filtering/searching, environment variables, tests, etc).



![Screenshot 2025-06-16 170711](https://github.com/user-attachments/assets/a6ce7739-950a-41c4-adfd-52efc34f33a9)
![Screenshot 2025-06-16 171608](https://github.com/user-attachments/assets/834c56fd-a4bd-4322-92d5-08c9fb7fc8ab)
![Screenshot 2025-06-16 170936](https://github.com/user-attachments/assets/6ff31822-cd5c-41bc-b102-2491170444ac)
![Screenshot 2025-06-16 171658](https://github.com/user-attachments/assets/c45ef89d-e6c0-440e-a4a6-606f313a1e60)
