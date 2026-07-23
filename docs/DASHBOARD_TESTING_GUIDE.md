# 📘 Britsync Dashboard Testing & Operations Guide

This guide provides step-by-step instructions for testing every dashboard and role within the Britsync Marketplace platform.

---

## 🎟️ What is a Support Ticket in Britsync?

A **Support Ticket** is Britsync's central customer support, escrow dispute, and quality assurance communication mechanism.

### How it Works:
1. **Creation**:
   - **Buyers** can submit support tickets regarding order inquiries, shipping delays, item condition issues, or escrow refund requests.
   - **Makers** can submit tickets regarding verification audits, payout delays, or catalog listing questions.
2. **Escalation & Moderation**:
   - Tickets are routed directly to **Admin** and **CEO** dashboards (`/dashboard/admin` and `/dashboard/ceo`).
   - Admins can review ticket logs, reply directly to users, update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`), or trigger escrow refunds.
3. **Escrow Guarantee Integration**:
   - If an open dispute ticket exists for an order, the Britsync Escrow ledger automatically locks maker payouts until the ticket is marked `RESOLVED`.

---

## 🔐 Credentials Summary

All accounts use the default password: **`password123`**

| Role / Dashboard | Login URL | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | `/login` | `admin@britsync.com` | `password123` |
| **CEO** | `/login` | `admin@britsync.com` | `password123` |
| **Buyer** | `/login` | `buyer@example.com` | `password123` |
| **Inspector** | `/login` | `tariq@britsync.com` | `password123` |
| **Maker** | `/login` | `maker1@example.com` | `password123` |

---

## 🧪 Step-by-Step Dashboard Testing Guide

### 1. Buyer Dashboard (`/dashboard/buyer`)
1. Log in with `buyer@example.com` / `password123`.
2. Navigate to `/dashboard/buyer`.
3. **Tabs to Test**:
   - **Orders**: View past orders, escrow payment status, delivery tracking, and download commercial receipts.
   - **Wishlist**: View saved artisan masterworks. Test removing or moving items to cart.
   - **Notifications**: View system alerts for order status changes and verification updates.
   - **Support Tickets**: Click "Submit Ticket" to create a test support request.

### 2. Maker Dashboard (`/dashboard/maker`)
1. Log in with `maker1@example.com` / `password123`.
2. Navigate to `/dashboard/maker`.
3. **Tabs to Test**:
   - **Products**: Click **"Add Product"**. Notice that the modal now asks for **Primary Image URL** and **Hover (Next Picture) Image URL** alongside name, price, stock, and category. Fill in details and click "Save Product".
   - **Orders**: View orders placed for your atelier products.
   - **Earnings & Wallet**: View cleared vs pending wallet balances, transaction logs, and test requesting a payout withdrawal.
   - **Verification & Passports**: Click "Request Verification Audit" to trigger an inspector assignment.
   - **Settings**: Update atelier business name, employee count, or years in business and click "Save Settings".

### 3. Inspector Dashboard (`/dashboard/inspector`)
1. Log in with `tariq@britsync.com` / `password123`.
2. Navigate to `/dashboard/inspector`.
3. **Workflows to Test**:
   - View assigned regional ateliers in South Asia / Mediterranean scope.
   - Click **"Verify Geofence"** to simulate physical on-site GPS check-in.
   - Review materials checklist and click **"Approve & Issue Certificate"** to grant Elite / GI tier status.

### 4. Admin Dashboard (`/dashboard/admin`)
1. Log in with `admin@britsync.com` / `password123`.
2. Navigate to `/dashboard/admin`.
3. **Modules to Test**:
   - **Overview**: View system KPIs (Total Revenue, Active Ateliers, Total Products, Orders).
   - **Product Moderation**: Approve or reject pending artisan listings.
   - **User Management**: Inspect buyers, makers, and field inspectors.
   - **Support Tickets**: Reply to open buyer tickets and update status to `RESOLVED`.
   - **Activity Logs**: View immutable security and system operation audit trails.

### 5. CEO Executive Dashboard (`/dashboard/ceo`)
1. Log in with `admin@britsync.com` / `password123`.
2. Navigate to `/dashboard/ceo`.
3. **Modules to Test**:
   - **Financial Analytics**: View GMV (Gross Merchandise Value), platform commission revenue split, and monthly sales trends.
   - **Regional Impact**: View artisan community payroll distribution across Pakistan, India, Turkey, Morocco, etc.
   - **CSV Export**: Click "Export Financial Statement" to generate executive audit reports.

---

## 🎨 Hover Next Image Feature Verification
- Go to `/search` or `/`.
- Hover over any product card in the grid.
- Notice the smooth 0.4s transition from the **Primary Image** to the **Next Image**!
