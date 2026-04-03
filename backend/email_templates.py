from typing import Dict, Any
from datetime import datetime

# BANK ME by Paype Technologies - Email Templates

BRAND_COLOR = "#6366F1"
COMPANY_NAME = "Paype Technologies Private Limited"
BRAND_NAME = "BANK ME"
LOGO_URL = "https://customer-assets.emergentagent.com/job_open-finance-1/artifacts/c367zd07_bankme%20logo.jpeg"

def get_email_header() -> str:
    return f"""
    <div style="background-color: {BRAND_COLOR}; padding: 30px; text-align: center;">
        <img src="{LOGO_URL}" alt="{BRAND_NAME}" style="width: 120px; height: 120px; margin-bottom: 15px;"/>
        <h1 style="color: white; margin: 0; font-size: 28px;">{BRAND_NAME}</h1>
        <p style="color: white; margin: 5px 0; font-size: 14px;">{COMPANY_NAME}</p>
    </div>
    """

def get_email_footer() -> str:
    return f"""
    <div style="background-color: #f3f4f6; padding: 30px; text-align: center; margin-top: 30px;">
        <p style="color: #6b7280; font-size: 14px; margin: 5px 0;">
            {BRAND_NAME} - Powered by {COMPANY_NAME}
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 5px 0;">
            Financial Inclusion for Everyone
        </p>
        <div style="margin-top: 15px;">
            <p style="color: #9ca3af; font-size: 11px;">
                This is an automated email. Please do not reply.
            </p>
            <p style="color: #9ca3af; font-size: 11px;">
                © {datetime.now().year} {COMPANY_NAME}. All rights reserved.
            </p>
        </div>
    </div>
    """

def generate_welcome_email(user_name: str, user_email: str, role: str) -> Dict[str, str]:
    """Generate welcome email for new users"""
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        {get_email_header()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white;">
            <h2 style="color: #111827; margin-bottom: 20px;">Welcome to {BRAND_NAME}! 🎉</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Dear {user_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Thank you for joining <strong>{BRAND_NAME}</strong>! Your account has been successfully created.
            </p>
            
            <div style="background-color: #eef2ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Email:</strong> {user_email}</p>
                <p style="margin: 5px 0;"><strong>Role:</strong> {role.replace('_', ' ').title()}</p>
            </div>
            
            <h3 style="color: #111827; margin-top: 30px;">What's Next?</h3>
            <ul style="color: #374151; line-height: 1.8;">
                <li>Complete your KYC verification</li>
                <li>Add money to your wallet</li>
                <li>Explore our services (AEPS, DMT, BBPS, Travel Booking)</li>
                <li>Start earning with our B2B network</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://open-finance-1.preview.emergentagent.com" 
                   style="background-color: {BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Open {BRAND_NAME} App
                </a>
            </div>
        </div>
        
        {get_email_footer()}
    </body>
    </html>
    """
    
    return {
        "subject": f"Welcome to {BRAND_NAME} - Your Account is Ready!",
        "html": body
    }

def generate_transaction_receipt(transaction_data: Dict[str, Any]) -> Dict[str, str]:
    """Generate transaction receipt email"""
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        {get_email_header()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px;">
                    ✓ Transaction Successful
                </div>
            </div>
            
            <h2 style="color: #111827; text-align: center;">Transaction Receipt</h2>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280;">Transaction ID</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: bold;">{transaction_data.get('transaction_id', 'N/A')}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280;">Type</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: bold;">{transaction_data.get('type', 'N/A').replace('_', ' ').title()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280;">Amount</td>
                        <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #10b981; font-size: 20px;">₹{transaction_data.get('amount', 0):.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280;">Date & Time</td>
                        <td style="padding: 10px 0; text-align: right;">{transaction_data.get('created_at', datetime.now()).strftime('%d %b %Y, %I:%M %p') if isinstance(transaction_data.get('created_at'), datetime) else 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #6b7280;">Status</td>
                        <td style="padding: 10px 0; text-align: right;">
                            <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px;">
                                {transaction_data.get('status', 'N/A').upper()}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 20px;">
                Thank you for using {BRAND_NAME}!
            </p>
        </div>
        
        {get_email_footer()}
    </body>
    </html>
    """
    
    return {
        "subject": f"{BRAND_NAME} - Transaction Receipt #{transaction_data.get('transaction_id', 'N/A')}",
        "html": body
    }

def generate_kyc_verification_email(user_name: str, status: str, message: str = "") -> Dict[str, str]:
    """Generate KYC verification status email"""
    
    if status == "verified":
        status_color = "#10b981"
        status_icon = "✓"
        title = "KYC Verification Successful!"
    else:
        status_color = "#ef4444"
        status_icon = "✗"
        title = "KYC Verification Update"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        {get_email_header()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: {status_color}; color: white; width: 60px; height: 60px; border-radius: 30px; line-height: 60px; font-size: 30px;">
                    {status_icon}
                </div>
            </div>
            
            <h2 style="color: #111827; text-align: center;">{title}</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Dear {user_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                {message if message else ('Your KYC verification has been completed successfully!' if status == 'verified' else 'Your KYC verification status has been updated.')}
            </p>
            
            <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #6b7280;">Status</p>
                <p style="margin: 10px 0; font-size: 24px; font-weight: bold; color: {status_color};">
                    {status.upper()}
                </p>
            </div>
            
            {f'<p style="color: #374151; font-size: 16px; line-height: 1.6;">You can now access all features of {BRAND_NAME}!</p>' if status == 'verified' else ''}
        </div>
        
        {get_email_footer()}
    </body>
    </html>
    """
    
    return {
        "subject": f"{BRAND_NAME} - KYC Verification {status.title()}",
        "html": body
    }

def generate_password_reset_email(user_name: str, reset_link: str) -> Dict[str, str]:
    """Generate password reset email"""
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        {get_email_header()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white;">
            <h2 style="color: #111827;">Password Reset Request</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Dear {user_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                We received a request to reset your {BRAND_NAME} account password.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}" 
                   style="background-color: {BRAND_COLOR}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
                This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                Or copy and paste this URL into your browser:<br/>
                <span style="word-break: break-all;">{reset_link}</span>
            </p>
        </div>
        
        {get_email_footer()}
    </body>
    </html>
    """
    
    return {
        "subject": f"{BRAND_NAME} - Password Reset Request",
        "html": body
    }

def generate_wallet_topup_email(user_name: str, amount: float, new_balance: float, transaction_id: str) -> Dict[str, str]:
    """Generate wallet top-up confirmation email"""
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
        {get_email_header()}
        
        <div style="max-width: 600px; margin: 0 auto; padding: 30px; background-color: white;">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; border-radius: 20px;">
                    ✓ Wallet Topped Up
                </div>
            </div>
            
            <h2 style="color: #111827; text-align: center;">Wallet Top-Up Successful</h2>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Dear {user_name},
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Your wallet has been successfully credited with ₹{amount:.2f}
            </p>
            
            <div style="background-color: #eef2ff; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 14px;">New Wallet Balance</p>
                <p style="margin: 10px 0; font-size: 36px; font-weight: bold; color: {BRAND_COLOR};">
                    ₹{new_balance:.2f}
                </p>
                <p style="margin: 10px 0; color: #9ca3af; font-size: 12px;">Transaction ID: {transaction_id}</p>
            </div>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6; text-align: center;">
                Thank you for using {BRAND_NAME}!
            </p>
        </div>
        
        {get_email_footer()}
    </body>
    </html>
    """
    
    return {
        "subject": f"{BRAND_NAME} - Wallet Topped Up ₹{amount:.2f}",
        "html": body
    }
