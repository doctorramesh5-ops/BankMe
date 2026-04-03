from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    WHITE_LABEL = "white_label"
    SUPER_DISTRIBUTOR = "super_distributor"
    DISTRIBUTOR = "distributor"
    RETAILER = "retailer"
    B2C_CUSTOMER = "b2c_customer"
    STAFF = "staff"

class KYCStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    REJECTED = "rejected"

class TransactionType(str, Enum):
    WALLET_TOPUP = "wallet_topup"
    WALLET_TRANSFER = "wallet_transfer"
    AEPS_WITHDRAWAL = "aeps_withdrawal"
    DMT = "dmt"
    BBPS = "bbps"
    IRCTC = "irctc"
    BUS_BOOKING = "bus_booking"
    TRAVEL_BOOKING = "travel_booking"
    DIGITAL_RUPEE = "digital_rupee"
    DEMAT_ACCOUNT = "demat_account"
    MUTUAL_FUND = "mutual_fund"
    PAN_CARD = "pan_card"

class TransactionStatus(str, Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"

# User Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    phone: str
    password: str
    role: UserRole
    full_name: str
    kyc_status: KYCStatus = KYCStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    # Hierarchy for B2B
    parent_id: Optional[str] = None
    hierarchy_level: int = 0
    
    # Location for retailers/shops
    location: Optional[Dict[str, Any]] = None
    pincode: Optional[str] = None
    
    # Biometric data reference
    biometric_registered: bool = False
    
class UserCreate(BaseModel):
    email: EmailStr
    phone: str
    password: str
    role: UserRole
    full_name: str
    parent_id: Optional[str] = None
    pincode: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    phone: str
    role: UserRole
    full_name: str
    kyc_status: KYCStatus
    is_active: bool

# KYC Models
class KYCDocument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    aadhaar_verified: bool = False
    pan_verified: bool = False
    digilocker_verified: bool = False
    biometric_verified: bool = False
    fingerprint_data: Optional[str] = None  # Base64 encrypted
    iris_data: Optional[str] = None  # Base64 encrypted
    verification_timestamp: Optional[datetime] = None
    status: KYCStatus = KYCStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KYCVerificationRequest(BaseModel):
    user_id: str
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    verification_type: str  # "aadhaar", "pan", "digilocker", "biometric"

# Wallet Models
class Wallet(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    balance: float = 0.0
    currency: str = "INR"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_transaction: Optional[datetime] = None

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_id: str = Field(default_factory=lambda: f"TXN{uuid.uuid4().hex[:12].upper()}")
    user_id: str
    wallet_id: str
    type: TransactionType
    amount: float
    status: TransactionStatus
    description: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # For transfers
    to_user_id: Optional[str] = None
    to_wallet_id: Optional[str] = None
    
    # Commission tracking
    commission: float = 0.0
    commission_paid_to: Optional[str] = None

class WalletTopupRequest(BaseModel):
    user_id: str
    amount: float
    payment_method: str  # "upi", "card", "netbanking", "qr"

class WalletTransferRequest(BaseModel):
    from_user_id: str
    to_user_id: str
    amount: float
    description: Optional[str] = "Wallet transfer"

# Service Request Models
class AEPSRequest(BaseModel):
    user_id: str
    aadhaar_number: str
    mobile_number: str
    bank_name: str
    transaction_type: str  # "withdrawal", "balance_inquiry", "mini_statement"
    amount: Optional[float] = None
    biometric_data: str  # Base64 fingerprint/iris

class DMTRequest(BaseModel):
    user_id: str
    beneficiary_name: str
    beneficiary_account: str
    beneficiary_ifsc: str
    amount: float
    mobile_number: str

class BBPSRequest(BaseModel):
    user_id: str
    biller_id: str
    consumer_number: str
    amount: float
    biller_category: str  # "electricity", "water", "gas", "telecom", etc.

class IRCTCBookingRequest(BaseModel):
    user_id: str
    from_station: str
    to_station: str
    journey_date: str
    passenger_details: List[Dict[str, Any]]
    train_number: str
    class_type: str

class BusBookingRequest(BaseModel):
    user_id: str
    from_city: str
    to_city: str
    journey_date: str
    passenger_details: List[Dict[str, Any]]
    bus_id: str
    seat_numbers: List[str]

class TravelBookingRequest(BaseModel):
    user_id: str
    booking_type: str  # "flight", "hotel", "package"
    travel_details: Dict[str, Any]

class TravelBookingRequest(BaseModel):
    user_id: str
    booking_type: str  # "flight", "hotel", "package"
    travel_details: Dict[str, Any]

class DematAccountRequest(BaseModel):
    user_id: str
    full_name: str
    pan_number: str
    email: str
    phone: str
    bank_account: str
    ifsc: str
    nominee_name: Optional[str] = None

class MutualFundRequest(BaseModel):
    user_id: str
    fund_name: str
    fund_code: str
    amount: float
    transaction_type: str  # "buy", "sell", "sip"
    folio_number: Optional[str] = None

class DigitalRupeeRequest(BaseModel):
    user_id: str
    transaction_type: str  # "load", "spend", "transfer"
    amount: float
    recipient_vpa: Optional[str] = None

class PANCardRequest(BaseModel):
    user_id: str
    full_name: str
    father_name: str
    dob: str
    email: str
    phone: str
    address: str
    aadhaar_number: str
    application_type: str  # "new", "reprint"

# Shop/Location Models
class Shop(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    owner_id: str  # Retailer user ID
    shop_name: str
    address: str
    pincode: str
    latitude: float
    longitude: float
    geo_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShopVisit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    staff_id: str
    shop_id: str
    visit_date: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
    geo_location: Dict[str, float]  # latitude, longitude
    status: str = "completed"

# Commission Model
class Commission(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transaction_id: str
    user_id: str  # Who earned the commission
    amount: float
    percentage: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid: bool = False
    paid_at: Optional[datetime] = None

# Response Models
class WalletResponse(BaseModel):
    id: str
    user_id: str
    balance: float
    currency: str
    
class TransactionResponse(BaseModel):
    id: str
    transaction_id: str
    type: str
    amount: float
    status: str
    description: str
    created_at: datetime

class ServiceResponse(BaseModel):
    success: bool
    message: str
    transaction_id: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
