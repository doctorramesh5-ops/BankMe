# 🏢 Fintech Inclusion Platform - Complete B2B Hierarchy

## 📊 Complete Hierarchy Structure

```
┌─────────────────────────────────────────────────┐
│                    ADMIN                        │
│        (System Administrator)                   │
│        admin@fintech.com                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                WHITE LABEL                      │
│        (Brand Partner - Optional)               │
│        whitelabel@fintech.com                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│            SUPER DISTRIBUTOR                    │
│        (Regional Head)                          │
│        superdist2@fintech.com                   │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│               DISTRIBUTOR                       │
│        (Area Manager)                           │
│        dist2@fintech.com                        │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│                 RETAILER                        │
│        (Shop Owner)                             │
│        retail2@fintech.com                      │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              B2C CUSTOMER                       │
│        (End User)                               │
│        customer@fintech.com                     │
└─────────────────────────────────────────────────┘
```

---

## 🔑 Login Credentials (Complete Hierarchy)

### 1️⃣ ADMIN (Top Level)
```
Email: admin@fintech.com
Password: admin123456
Role: System Admin
Phone: 9876543200

Powers:
✅ Full system access
✅ Create/manage White Labels
✅ View all transactions
✅ System configuration
✅ Manage all users
```

### 2️⃣ WHITE LABEL (Optional Brand Partner)
```
Email: whitelabel@fintech.com
Password: white123456
Role: White Label Partner
Phone: 9876543201
Reports To: Admin

Powers:
✅ Create branded experience
✅ Manage Super Distributors
✅ Custom commission structure
✅ Brand-specific reports
✅ Network overview
```

### 3️⃣ SUPER DISTRIBUTOR
```
Email: superdist2@fintech.com
Password: super123456
Role: Super Distributor
Phone: 9876543202
Pincode: 400001
Reports To: White Label

Powers:
✅ Manage distributors
✅ Highest commission tier
✅ Regional control
✅ Performance reports
✅ Onboard new distributors
```

### 4️⃣ DISTRIBUTOR
```
Email: dist2@fintech.com
Password: dist123456
Role: Distributor
Phone: 9876543203
Pincode: 400002
Reports To: Super Distributor

Powers:
✅ Manage retailers
✅ Area-level operations
✅ Commission from retailers
✅ Stock management
✅ Retailer onboarding
```

### 5️⃣ RETAILER (Shop Owner)
```
Email: retail2@fintech.com
Password: retail123456
Role: Retailer
Phone: 9876543204
Pincode: 400003
Reports To: Distributor

Powers:
✅ Serve B2C customers
✅ All financial services
✅ Shop geo-tagging
✅ Transaction processing
✅ Commission earnings
```

### 6️⃣ B2C CUSTOMER (End User)
```
Email: customer@fintech.com
Password: customer123
Role: Customer
Phone: 9876543205

Services:
✅ Use all services via retailers
✅ Personal wallet
✅ Transaction history
✅ Self-service options
```

---

## 💼 Commission Flow Example

```
Transaction Amount: ₹10,000

B2C Customer pays → ₹10,000
    ↓
Retailer Commission: ₹50 (0.5%)
    ↓
Distributor Commission: ₹30 (0.3%)
    ↓
Super Distributor Commission: ₹20 (0.2%)
    ↓
White Label Commission: ₹10 (0.1%)
    ↓
Admin Platform Fee: ₹90 (0.9%)
```

---

## 🎯 How to Test the Hierarchy

### Test 1: Login as Admin
1. Go to: https://open-finance-1.preview.emergentagent.com
2. Login: `admin@fintech.com` / `admin123456`
3. View: Complete system overview
4. Check: All user management features

### Test 2: Login as White Label
1. Login: `whitelabel@fintech.com` / `white123456`
2. View: Your network (Super Distributors, Distributors, Retailers)
3. Check: Commission reports for your brand

### Test 3: Login as Super Distributor
1. Login: `superdist2@fintech.com` / `super123456`
2. View: Your distributors and their performance
3. Check: Regional transaction volume

### Test 4: Login as Distributor
1. Login: `dist2@fintech.com` / `dist123456`
2. View: Your retailers
3. Check: Area-level reports

### Test 5: Login as Retailer
1. Login: `retail2@fintech.com` / `retail123456`
2. Provide: All services to customers
3. Check: Your commission earnings

### Test 6: Login as Customer
1. Login: `customer@fintech.com` / `customer123`
2. Use: All financial services
3. Check: Personal transaction history

---

## 🌟 White Label Feature

**When to use White Label:**
- When a client wants their own branded fintech platform
- Corporate partnerships
- Banks wanting their own interface
- Large enterprises needing custom solutions

**White Label gets:**
- Custom branding (logo, colors, name)
- Own domain/subdomain
- Complete network under their brand
- Custom commission structure
- Dedicated support

---

## 📱 Access Your App
**URL**: https://open-finance-1.preview.emergentagent.com

**Try logging in with different roles to see different dashboards!**

---

## 🔐 Quick Login Guide

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fintech.com | admin123456 |
| White Label | whitelabel@fintech.com | white123456 |
| Super Distributor | superdist2@fintech.com | super123456 |
| Distributor | dist2@fintech.com | dist123456 |
| Retailer | retail2@fintech.com | retail123456 |
| Customer | customer@fintech.com | customer123 |

---

## ✅ What's Working Now

✓ Complete 6-level hierarchy
✓ Role-based dashboards
✓ Parent-child relationships
✓ Commission tracking structure
✓ All financial services
✓ Wallet for each user
✓ Transaction history

---

## 📊 Backend APIs Available

- `/api/hierarchy/tree/{user_id}` - View your network
- `/api/reports/commission` - Commission reports
- `/api/users` - User management (admin only)
- All service APIs (AEPS, DMT, BBPS, etc.)

---

**Your complete B2B hierarchy is ready to test!** 🚀
