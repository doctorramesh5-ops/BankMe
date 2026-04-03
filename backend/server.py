from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid

# Import local modules
from models import (
    User, UserCreate, UserLogin, UserResponse, UserRole,
    KYCDocument, KYCVerificationRequest, KYCStatus,
    Wallet, WalletResponse, Transaction, TransactionResponse,
    WalletTopupRequest, WalletTransferRequest, TransactionStatus, TransactionType,
    AEPSRequest, DMTRequest, BBPSRequest, IRCTCBookingRequest, BusBookingRequest, TravelBookingRequest,
    DematAccountRequest, MutualFundRequest, DigitalRupeeRequest, PANCardRequest,
    Shop, ShopVisit, Commission, ServiceResponse
)
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, require_roles
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create the main app
app = FastAPI(title="Fintech Inclusion Platform", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ==================== AUTH ROUTES ====================
@api_router.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user exists
        existing_user = await db.users.find_one({"email": user_data.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = get_password_hash(user_data.password)
        
        # Calculate hierarchy level
        hierarchy_level = 0
        if user_data.parent_id:
            parent = await db.users.find_one({"id": user_data.parent_id})
            if parent:
                hierarchy_level = parent.get("hierarchy_level", 0) + 1
        
        # Create user
        user = User(
            **user_data.dict(exclude={"password"}),
            password=hashed_password,
            hierarchy_level=hierarchy_level
        )
        
        await db.users.insert_one(user.dict())
        
        # Create wallet for user
        wallet = Wallet(user_id=user.id)
        await db.wallets.insert_one(wallet.dict())
        
        logger.info(f"User registered: {user.email} with role {user.role}")
        
        return UserResponse(**user.dict())
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login user"""
    try:
        user = await db.users.find_one({"email": credentials.email})
        if not user or not verify_password(credentials.password, user["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password"
            )
        
        if not user.get("is_active", True):
            raise HTTPException(status_code=400, detail="Account is inactive")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["id"], "role": user["role"]}
        )
        
        logger.info(f"User logged in: {user['email']}")
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(**user)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    user = await db.users.find_one({"id": current_user["user_id"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(**user)

# ==================== KYC ROUTES ====================
@api_router.post("/kyc/verify")
async def verify_kyc(request: KYCVerificationRequest, current_user: dict = Depends(get_current_user)):
    """Verify KYC documents (mocked with integration points)"""
    try:
        # Get or create KYC document
        kyc_doc = await db.kyc_documents.find_one({"user_id": request.user_id})
        
        if not kyc_doc:
            kyc_doc = KYCDocument(user_id=request.user_id).dict()
        
        # Mock verification based on type
        if request.verification_type == "aadhaar":
            # TODO: Integrate with Digio API for Aadhaar verification
            kyc_doc["aadhaar_number"] = request.aadhaar_number
            kyc_doc["aadhaar_verified"] = True
            logger.info(f"[MOCK] Aadhaar verified: {request.aadhaar_number}")
        
        elif request.verification_type == "pan":
            # TODO: Integrate with Digio API for PAN verification
            kyc_doc["pan_number"] = request.pan_number
            kyc_doc["pan_verified"] = True
            logger.info(f"[MOCK] PAN verified: {request.pan_number}")
        
        elif request.verification_type == "biometric":
            # TODO: Integrate with Mantra/Morpho/Startek device SDKs
            kyc_doc["biometric_verified"] = True
            logger.info(f"[MOCK] Biometric verified")
        
        elif request.verification_type == "digilocker":
            # TODO: Integrate with DigiLocker API
            kyc_doc["digilocker_verified"] = True
            logger.info(f"[MOCK] DigiLocker verified")
        
        kyc_doc["verification_timestamp"] = datetime.utcnow()
        
        # Update KYC status
        all_verified = (
            kyc_doc.get("aadhaar_verified", False) and
            kyc_doc.get("pan_verified", False) and
            kyc_doc.get("biometric_verified", False)
        )
        kyc_doc["status"] = KYCStatus.VERIFIED if all_verified else KYCStatus.IN_PROGRESS
        
        await db.kyc_documents.update_one(
            {"user_id": request.user_id},
            {"$set": kyc_doc},
            upsert=True
        )
        
        # Update user KYC status
        if all_verified:
            await db.users.update_one(
                {"id": request.user_id},
                {"$set": {"kyc_status": KYCStatus.VERIFIED}}
            )
        
        return {"success": True, "message": "KYC verification completed", "kyc_status": kyc_doc["status"]}
    except Exception as e:
        logger.error(f"KYC verification error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/kyc/status/{user_id}")
async def get_kyc_status(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get KYC status for a user"""
    kyc_doc = await db.kyc_documents.find_one({"user_id": user_id})
    if not kyc_doc:
        return {"status": "pending", "message": "KYC not initiated"}
    return kyc_doc

# ==================== WALLET ROUTES ====================
@api_router.get("/wallet/balance", response_model=WalletResponse)
async def get_wallet_balance(current_user: dict = Depends(get_current_user)):
    """Get wallet balance"""
    wallet = await db.wallets.find_one({"user_id": current_user["user_id"]})
    if not wallet:
        # Create wallet if not exists
        wallet = Wallet(user_id=current_user["user_id"])
        await db.wallets.insert_one(wallet.dict())
    return WalletResponse(**wallet)

@api_router.post("/wallet/topup")
async def topup_wallet(request: WalletTopupRequest, current_user: dict = Depends(get_current_user)):
    """Top-up wallet (Razorpay integration point)"""
    try:
        # TODO: Integrate with Razorpay for actual payment
        # For now, mock the top-up
        wallet = await db.wallets.find_one({"user_id": request.user_id})
        if not wallet:
            raise HTTPException(status_code=404, detail="Wallet not found")
        
        # Create transaction
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id=wallet["id"],
            type=TransactionType.WALLET_TOPUP,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=f"Wallet top-up via {request.payment_method}",
            metadata={"payment_method": request.payment_method}
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        # Update wallet balance
        new_balance = wallet["balance"] + request.amount
        await db.wallets.update_one(
            {"user_id": request.user_id},
            {"$set": {"balance": new_balance, "last_transaction": datetime.utcnow()}}
        )
        
        logger.info(f"[MOCK] Wallet topped up: {request.amount} for user {request.user_id}")
        
        return {
            "success": True,
            "message": "Wallet topped up successfully",
            "transaction_id": transaction.transaction_id,
            "new_balance": new_balance
        }
    except Exception as e:
        logger.error(f"Wallet top-up error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/wallet/transfer")
async def transfer_wallet(request: WalletTransferRequest, current_user: dict = Depends(get_current_user)):
    """Wallet-to-wallet transfer"""
    try:
        # Get sender wallet
        sender_wallet = await db.wallets.find_one({"user_id": request.from_user_id})
        if not sender_wallet:
            raise HTTPException(status_code=404, detail="Sender wallet not found")
        
        if sender_wallet["balance"] < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Get receiver wallet
        receiver_wallet = await db.wallets.find_one({"user_id": request.to_user_id})
        if not receiver_wallet:
            raise HTTPException(status_code=404, detail="Receiver wallet not found")
        
        # Create transaction
        transaction = Transaction(
            user_id=request.from_user_id,
            wallet_id=sender_wallet["id"],
            type=TransactionType.WALLET_TRANSFER,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=request.description,
            to_user_id=request.to_user_id,
            to_wallet_id=receiver_wallet["id"]
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        # Update balances
        await db.wallets.update_one(
            {"user_id": request.from_user_id},
            {"$set": {"balance": sender_wallet["balance"] - request.amount}}
        )
        
        await db.wallets.update_one(
            {"user_id": request.to_user_id},
            {"$set": {"balance": receiver_wallet["balance"] + request.amount}}
        )
        
        logger.info(f"Transfer completed: {request.amount} from {request.from_user_id} to {request.to_user_id}")
        
        return {
            "success": True,
            "message": "Transfer completed successfully",
            "transaction_id": transaction.transaction_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Transfer error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/wallet/transactions")
async def get_transactions(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    skip: int = 0
):
    """Get user transactions"""
    transactions = await db.transactions.find(
        {"user_id": current_user["user_id"]}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return [TransactionResponse(**txn) for txn in transactions]

# ==================== SERVICES ROUTES ====================
@api_router.post("/services/aeps", response_model=ServiceResponse)
async def aeps_service(request: AEPSRequest, current_user: dict = Depends(get_current_user)):
    """AEPS Service (Fino + Eko integration point)"""
    try:
        # TODO: Integrate with Fino Payments Bank and Eko India APIs
        logger.info(f"[MOCK] AEPS Request: {request.transaction_type} for user {request.user_id}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.AEPS_WITHDRAWAL,
            amount=request.amount or 0,
            status=TransactionStatus.SUCCESS,
            description=f"AEPS {request.transaction_type}",
            metadata={"aadhaar": request.aadhaar_number[-4:], "bank": request.bank_name}
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"AEPS {request.transaction_type} completed successfully",
            transaction_id=transaction.transaction_id,
            data={"amount": request.amount, "balance": 5000.00}  # Mock balance
        )
    except Exception as e:
        logger.error(f"AEPS error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/dmt", response_model=ServiceResponse)
async def dmt_service(request: DMTRequest, current_user: dict = Depends(get_current_user)):
    """DMT Service (Eko India integration point)"""
    try:
        # TODO: Integrate with Eko India DMT API
        logger.info(f"[MOCK] DMT Request: {request.amount} to {request.beneficiary_account}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.DMT,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=f"Money transfer to {request.beneficiary_name}",
            metadata={
                "beneficiary_account": request.beneficiary_account,
                "ifsc": request.beneficiary_ifsc
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message="Money transfer completed successfully",
            transaction_id=transaction.transaction_id,
            data={"beneficiary": request.beneficiary_name, "amount": request.amount}
        )
    except Exception as e:
        logger.error(f"DMT error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/bbps", response_model=ServiceResponse)
async def bbps_service(request: BBPSRequest, current_user: dict = Depends(get_current_user)):
    """BBPS Service (Pine Labs/Setu integration point)"""
    try:
        # TODO: Integrate with Pine Labs Setu BBPS API
        logger.info(f"[MOCK] BBPS Request: {request.biller_category} for {request.consumer_number}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.BBPS,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=f"{request.biller_category} bill payment",
            metadata={
                "biller_id": request.biller_id,
                "consumer_number": request.consumer_number
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message="Bill payment completed successfully",
            transaction_id=transaction.transaction_id,
            data={"biller_category": request.biller_category, "amount": request.amount}
        )
    except Exception as e:
        logger.error(f"BBPS error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/irctc", response_model=ServiceResponse)
async def irctc_booking(request: IRCTCBookingRequest, current_user: dict = Depends(get_current_user)):
    """IRCTC Booking (IRCTC API integration point)"""
    try:
        # TODO: Integrate with IRCTC API
        logger.info(f"[MOCK] IRCTC Booking: {request.train_number} from {request.from_station} to {request.to_station}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.IRCTC,
            amount=1500.00,  # Mock amount
            status=TransactionStatus.SUCCESS,
            description=f"Train booking - {request.train_number}",
            metadata={
                "train_number": request.train_number,
                "from_station": request.from_station,
                "to_station": request.to_station,
                "journey_date": request.journey_date
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message="Train booking completed successfully",
            transaction_id=transaction.transaction_id,
            data={"pnr": f"PNR{uuid.uuid4().hex[:10].upper()}", "train_number": request.train_number}
        )
    except Exception as e:
        logger.error(f"IRCTC error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/bus", response_model=ServiceResponse)
async def bus_booking(request: BusBookingRequest, current_user: dict = Depends(get_current_user)):
    """Bus Booking (RedBus API integration point)"""
    try:
        # TODO: Integrate with RedBus API
        logger.info(f"[MOCK] Bus Booking: {request.bus_id} from {request.from_city} to {request.to_city}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.BUS_BOOKING,
            amount=800.00,  # Mock amount
            status=TransactionStatus.SUCCESS,
            description=f"Bus booking - {request.bus_id}",
            metadata={
                "bus_id": request.bus_id,
                "from_city": request.from_city,
                "to_city": request.to_city,
                "seats": request.seat_numbers
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message="Bus booking completed successfully",
            transaction_id=transaction.transaction_id,
            data={"booking_id": f"BUS{uuid.uuid4().hex[:10].upper()}", "seats": request.seat_numbers}
        )
    except Exception as e:
        logger.error(f"Bus booking error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/travel", response_model=ServiceResponse)
async def travel_booking(request: TravelBookingRequest, current_user: dict = Depends(get_current_user)):
    """Travel Booking (TBO Holidays integration point)"""
    try:
        # TODO: Integrate with TBO Holidays API
        logger.info(f"[MOCK] Travel Booking: {request.booking_type}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.TRAVEL_BOOKING,
            amount=10000.00,  # Mock amount
            status=TransactionStatus.SUCCESS,
            description=f"{request.booking_type} booking",
            metadata=request.travel_details
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"{request.booking_type} booking completed successfully",
            transaction_id=transaction.transaction_id,
            data={"booking_type": request.booking_type, "booking_id": f"TRV{uuid.uuid4().hex[:10].upper()}"}
        )
    except Exception as e:
        logger.error(f"Travel booking error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/travel", response_model=ServiceResponse)
async def travel_booking(request: TravelBookingRequest, current_user: dict = Depends(get_current_user)):
    """Travel Booking (TBO Holidays integration point)"""
    try:
        # TODO: Integrate with TBO Holidays API
        logger.info(f"[MOCK] Travel Booking: {request.booking_type}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.TRAVEL_BOOKING,
            amount=10000.00,  # Mock amount
            status=TransactionStatus.SUCCESS,
            description=f"{request.booking_type} booking",
            metadata=request.travel_details
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"{request.booking_type} booking completed successfully",
            transaction_id=transaction.transaction_id,
            data={"booking_type": request.booking_type, "booking_id": f"TRV{uuid.uuid4().hex[:10].upper()}"}
        )
    except Exception as e:
        logger.error(f"Travel booking error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/demat", response_model=ServiceResponse)
async def demat_account_opening(request: DematAccountRequest, current_user: dict = Depends(get_current_user)):
    """Demat Account Opening (Integration point for CDSL/NSDL)"""
    try:
        # TODO: Integrate with Demat account provider API (e.g., Zerodha, Upstox, etc.)
        logger.info(f"[MOCK] Demat Account Opening: {request.full_name}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.DEMAT_ACCOUNT,
            amount=299.00,  # Account opening fee
            status=TransactionStatus.SUCCESS,
            description="Demat account opening",
            metadata={
                "full_name": request.full_name,
                "pan_number": request.pan_number,
                "email": request.email,
                "phone": request.phone
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message="Demat account application submitted successfully",
            transaction_id=transaction.transaction_id,
            data={
                "application_id": f"DEMAT{uuid.uuid4().hex[:10].upper()}",
                "account_type": "Trading + Demat",
                "status": "under_verification"
            }
        )
    except Exception as e:
        logger.error(f"Demat account error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/mutual-fund", response_model=ServiceResponse)
async def mutual_fund_transaction(request: MutualFundRequest, current_user: dict = Depends(get_current_user)):
    """Mutual Fund Investment (Integration point for MF distributors)"""
    try:
        # TODO: Integrate with MF platform API (BSE Star, NSE, AMC APIs)
        logger.info(f"[MOCK] Mutual Fund {request.transaction_type}: {request.fund_name}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.MUTUAL_FUND,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=f"Mutual Fund {request.transaction_type} - {request.fund_name}",
            metadata={
                "fund_name": request.fund_name,
                "fund_code": request.fund_code,
                "transaction_type": request.transaction_type,
                "folio_number": request.folio_number
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"Mutual fund {request.transaction_type} order placed successfully",
            transaction_id=transaction.transaction_id,
            data={
                "fund_name": request.fund_name,
                "units": round(request.amount / 150.50, 4),  # Mock NAV
                "folio_number": request.folio_number or f"FOL{uuid.uuid4().hex[:8].upper()}",
                "order_status": "pending"
            }
        )
    except Exception as e:
        logger.error(f"Mutual fund error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/digital-rupee", response_model=ServiceResponse)
async def digital_rupee_transaction(request: DigitalRupeeRequest, current_user: dict = Depends(get_current_user)):
    """Digital e-Rupee (CBDC) transactions"""
    try:
        # TODO: Integrate with RBI Digital Rupee API (when available)
        logger.info(f"[MOCK] Digital Rupee {request.transaction_type}: \u20b9{request.amount}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.DIGITAL_RUPEE,
            amount=request.amount,
            status=TransactionStatus.SUCCESS,
            description=f"Digital Rupee {request.transaction_type}",
            metadata={
                "transaction_type": request.transaction_type,
                "recipient_vpa": request.recipient_vpa
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"Digital Rupee {request.transaction_type} completed successfully",
            transaction_id=transaction.transaction_id,
            data={
                "amount": request.amount,
                "cbdc_balance": 5000.00,  # Mock balance
                "upi_id": f"user@erupee"
            }
        )
    except Exception as e:
        logger.error(f"Digital Rupee error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

@api_router.post("/services/pan-card", response_model=ServiceResponse)
async def pan_card_application(request: PANCardRequest, current_user: dict = Depends(get_current_user)):
    """PAN Card Registration/Application"""
    try:
        # TODO: Integrate with NSDL/UTIITSL PAN application API
        logger.info(f"[MOCK] PAN Card Application: {request.full_name}")
        
        transaction = Transaction(
            user_id=request.user_id,
            wallet_id="system",
            type=TransactionType.PAN_CARD,
            amount=107.00 if request.application_type == "new" else 50.00,  # Application fee
            status=TransactionStatus.SUCCESS,
            description=f"PAN card {request.application_type} application",
            metadata={
                "full_name": request.full_name,
                "father_name": request.father_name,
                "dob": request.dob,
                "aadhaar_number": request.aadhaar_number[-4:],
                "application_type": request.application_type
            }
        )
        
        await db.transactions.insert_one(transaction.dict())
        
        return ServiceResponse(
            success=True,
            message=f"PAN card {request.application_type} application submitted successfully",
            transaction_id=transaction.transaction_id,
            data={
                "acknowledgement_number": f"ACK{uuid.uuid4().hex[:12].upper()}",
                "application_type": request.application_type,
                "estimated_delivery": "15-20 business days",
                "status": "submitted"
            }
        )
    except Exception as e:
        logger.error(f"PAN card error: {str(e)}")
        return ServiceResponse(success=False, message=str(e))

# ==================== SHOP & GEO-TAGGING ROUTES ====================
@api_router.post("/shops/register")
async def register_shop(shop: Shop, current_user: dict = Depends(get_current_user)):
    """Register a shop with geo-location"""
    try:
        await db.shops.insert_one(shop.dict())
        logger.info(f"Shop registered: {shop.shop_name} at {shop.latitude}, {shop.longitude}")
        return {"success": True, "message": "Shop registered successfully", "shop_id": shop.id}
    except Exception as e:
        logger.error(f"Shop registration error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/shops/nearby")
async def get_nearby_shops(
    latitude: float,
    longitude: float,
    radius_km: float = 5.0,
    current_user: dict = Depends(get_current_user)
):
    """Get nearby shops (simplified geo query)"""
    # TODO: Implement proper geo-spatial query
    shops = await db.shops.find().to_list(100)
    return shops

@api_router.post("/shops/visit")
async def record_shop_visit(visit: ShopVisit, current_user: dict = Depends(get_current_user)):
    """Record shop visit by staff"""
    try:
        await db.shop_visits.insert_one(visit.dict())
        logger.info(f"Shop visit recorded: Staff {visit.staff_id} visited Shop {visit.shop_id}")
        return {"success": True, "message": "Shop visit recorded"}
    except Exception as e:
        logger.error(f"Shop visit error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== HIERARCHY & B2B ROUTES ====================
@api_router.get("/hierarchy/tree/{user_id}")
async def get_hierarchy_tree(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get user hierarchy tree"""
    children = await db.users.find({"parent_id": user_id}).to_list(100)
    return {
        "user_id": user_id,
        "children": [UserResponse(**child) for child in children]
    }

@api_router.get("/reports/commission")
async def get_commission_report(
    current_user: dict = Depends(get_current_user),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None
):
    """Get commission report"""
    query = {"user_id": current_user["user_id"]}
    commissions = await db.commissions.find(query).to_list(1000)
    
    total_commission = sum(c["amount"] for c in commissions)
    paid_commission = sum(c["amount"] for c in commissions if c.get("paid", False))
    
    return {
        "total_commission": total_commission,
        "paid_commission": paid_commission,
        "pending_commission": total_commission - paid_commission,
        "commissions": commissions
    }

# ==================== HEALTH CHECK ====================
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
