# Fintech Inclusion Platform - Project Documentation

## Overview
This is a comprehensive enterprise-level Fintech inclusion platform built with:
- **Frontend**: React Native + Expo (Mobile & Web)
- **Backend**: FastAPI + Python
- **Database**: MongoDB
- **Authentication**: JWT-based

## Features Implemented

### 1. User Management & Authentication
- Multi-role system (Admin, White Label, Super Distributor, Distributor, Retailer, B2C Customer, Staff)
- JWT-based authentication
- Role-based access control
- User registration with hierarchy support
- Secure password hashing with bcrypt

### 2. KYC Verification System
- **Integration Points Ready**:
  - Digio API for Aadhaar eKYC
  - PAN verification
  - DigiLocker integration
  - Biometric authentication (Mantra/Morpho/Startek devices)
- eKYC status tracking
- Document verification workflow

### 3. Wallet & Payment System
- Digital wallet for each user
- **Razorpay Integration Points**:
  - Wallet top-up via UPI, QR Code, Cards, Net Banking
  - Payout capabilities
- Wallet-to-wallet transfers
- Transaction history

### 4. Financial Services
#### AEPS (Aadhaar Enabled Payment System)
- **Fino Payments Bank & Eko India integration points**
- Cash withdrawal
- Balance inquiry
- Mini statement
- Biometric authentication

#### DMT (Domestic Money Transfer)
- **Eko India API integration point**
- IMPS/NEFT transfers
- Beneficiary management

#### BBPS (Bharat Bill Payment System)
- **Pine Labs Setu integration point**
- Bill payments for:
  - Electricity
  - Water
  - Gas
  - Telecom
  - DTH
  - And more

### 5. Travel & Booking Services
#### IRCTC Integration
- Train ticket booking
- **IRCTC API integration point**

#### Bus Booking
- **RedBus API integration point**
- Inter-city bus bookings

#### Travel Packages
- **TBO Holidays integration point**
- Flight, hotel, and package bookings

### 6. Digital e-Rupee
- Integration point ready for RBI Digital Rupee pilot

### 7. B2B Hierarchy Management
- Multi-level hierarchy (Admin → White Label → Super Distributor → Distributor → Retailer)
- Commission tracking and distribution
- Parent-child relationship management
- Hierarchy tree visualization

### 8. Shop & Location Management
- Geo-tagging for retail shops
- Shop registration with GPS coordinates
- Nearby shop finder
- Staff visit tracking

### 9. Biometric Integration
- Ready for device SDKs:
  - Mantra (MFS100, MFS110, MARC11)
  - Morpho (MSO1300 E3)
  - Startek (FM220U)
  - Precision (PB510)
  - SecuGen (Hamster Pro)
- Fingerprint authentication
- Iris scanning support

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### KYC
- `POST /api/kyc/verify` - Verify KYC documents
- `GET /api/kyc/status/{user_id}` - Get KYC status

### Wallet
- `GET /api/wallet/balance` - Get wallet balance
- `POST /api/wallet/topup` - Top-up wallet
- `POST /api/wallet/transfer` - Wallet-to-wallet transfer
- `GET /api/wallet/transactions` - Transaction history

### Services
- `POST /api/services/aeps` - AEPS service
- `POST /api/services/dmt` - DMT service
- `POST /api/services/bbps` - BBPS bill payment
- `POST /api/services/irctc` - IRCTC booking
- `POST /api/services/bus` - Bus booking
- `POST /api/services/travel` - Travel booking

### Shop Management
- `POST /api/shops/register` - Register shop
- `GET /api/shops/nearby` - Get nearby shops
- `POST /api/shops/visit` - Record shop visit

### Hierarchy
- `GET /api/hierarchy/tree/{user_id}` - Get hierarchy tree
- `GET /api/reports/commission` - Commission report

## Integration Requirements

### Required API Keys

1. **Digio** (KYC)
   - Client ID
   - Client Secret
   - Base URL: https://ext.digio.in:444 (sandbox)

2. **Razorpay** (Payments)
   - Key ID
   - Key Secret
   - Webhook Secret

3. **Fino Payments Bank** (AEPS & Micro ATM)
   - API credentials
   - Host-to-host integration

4. **Eko India** (AEPS & DMT)
   - Developer key
   - API endpoint access

5. **Pine Labs Setu** (BBPS)
   - Bridge portal access
   - API credentials

6. **IRCTC** (Train Booking)
   - Partner API access
   - Digital certificate

7. **RedBus** (Bus Booking)
   - Partner credentials
   - API keys

8. **TBO Holidays** (Travel)
   - Partner access
   - API credentials

### Biometric Device SDKs
- Contact vendors for SDK integration:
  - Mantra: mantratec.com
  - Morpho/IDEMIA: morpho.com
  - Startek: startekengineering.com

## Database Schema

### Collections
1. **users** - User accounts with roles
2. **kyc_documents** - KYC verification data
3. **wallets** - User wallets
4. **transactions** - All financial transactions
5. **shops** - Retail shop information
6. **shop_visits** - Staff visit logs
7. **commissions** - Commission tracking

## Mobile App Structure

```
app/
├── index.tsx - Login screen
├── register.tsx - Registration screen
├── (tabs)/ - Main app tabs (to be implemented)
│   ├── dashboard.tsx
│   ├── wallet.tsx
│   ├── services.tsx
│   └── profile.tsx
├── kyc/ - KYC screens
├── services/ - Service-specific screens
└── hierarchy/ - B2B hierarchy screens
```

## Next Steps to Complete

### Phase 1 - Core UI (Current Priority)
1. Create tab navigation layout
2. Dashboard screen with role-based content
3. Wallet screen with balance and transactions
4. Services menu screen
5. Profile screen

### Phase 2 - KYC Implementation
1. Integrate Digio SDK
2. Implement Aadhaar OTP flow
3. PAN verification screen
4. Biometric capture screen
5. DigiLocker integration

### Phase 3 - Service Screens
1. AEPS transaction screen
2. DMT beneficiary management
3. BBPS biller selection
4. IRCTC search and booking
5. Bus booking flow
6. Travel booking interface

### Phase 4 - B2B Features
1. Hierarchy visualization
2. Commission dashboard
3. Shop management interface
4. Staff visit recording
5. Geo-location tracking

### Phase 5 - Real Integrations
1. Replace mock services with real API calls
2. Implement Razorpay payment gateway
3. Integrate all third-party services
4. Add biometric device communication
5. Test end-to-end flows

## Testing

### API Testing
```bash
# Register user
curl -X POST http://localhost:8001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "9876543210",
    "role": "b2c_customer"
  }'

# Login
curl -X POST http://localhost:8001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get wallet balance (with token)
curl -X GET http://localhost:8001/api/wallet/balance \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Security Considerations

1. **JWT Tokens**: Securely stored in AsyncStorage
2. **Password Hashing**: Bcrypt with salt
3. **API Security**: HTTPS only in production
4. **Sensitive Data**: Encrypted biometric data
5. **Rate Limiting**: To be implemented
6. **Input Validation**: Pydantic models
7. **CORS**: Configured for production domains

## Deployment Checklist

- [ ] Set up production MongoDB
- [ ] Configure production API keys
- [ ] Enable HTTPS
- [ ] Set up error monitoring (Sentry)
- [ ] Configure logging
- [ ] Set up backup system
- [ ] Enable rate limiting
- [ ] Configure CDN for assets
- [ ] Set up CI/CD pipeline
- [ ] Perform security audit
- [ ] Load testing
- [ ] Compliance verification (RBI guidelines)

## Support & Maintenance

### Vendor Contacts Required
1. Digio support for KYC issues
2. Razorpay merchant support
3. Fino Payments Bank technical team
4. Eko India developer support
5. Pine Labs Setu support
6. IRCTC API support team
7. RedBus partner support
8. Biometric device vendor support

## Compliance & Regulatory

### Indian Fintech Regulations
- RBI Payment Aggregator guidelines
- KYC compliance (PMLA 2002)
- Data protection (IT Act 2000)
- NPCI BBPS guidelines
- Aadhaar authentication regulations
- PAN verification requirements

### Required Licenses
- Payment Aggregator License (if facilitating payments)
- NBFC License (if providing lending)
- State-specific registrations for shops

## Current Status

✅ Backend API - Complete with mock integrations
✅ Database Models - All schemas defined
✅ Authentication System - JWT-based auth ready
✅ Login & Registration - UI implemented
🔄 Main App Screens - In progress
🔄 KYC Flow - Backend ready, UI pending
🔄 Service Integrations - Mock ready, real APIs pending
🔄 B2B Features - Backend ready, UI pending

## Notes

- All services are currently MOCKED for development
- Real API integrations require vendor credentials
- Biometric device integration requires physical devices
- Compliance audit needed before production launch
- Regular security updates required
- Monitor RBI guidelines for regulatory changes
