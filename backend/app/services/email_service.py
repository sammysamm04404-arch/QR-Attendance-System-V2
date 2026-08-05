import os
import smtplib
from email.utils import formatdate, make_msgid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
from jinja2 import Environment, FileSystemLoader, select_autoescape

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL")

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"])
)

class EmailService:

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        html: str,
        plain_text: str
    ):
        # 1. MUST use 'alternative' for HTML + Plain text delivery
        message = MIMEMultipart("alternative")

        # 2. Format From header with a clear display name
        message["From"] = f"QR Attendance System <{EMAIL_FROM}>"
        message["To"] = recipient
        message["Subject"] = subject

        message["Date"] = formatdate(localtime=True)
        message["Message-ID"] = make_msgid()
        message["Reply-To"] = EMAIL_FROM
        message["X-Mailer"] = "QR Attendance System"

        # 3. Attach plain text FIRST, HTML SECOND (Standard RFC requirement)
        message.attach(MIMEText(plain_text, "plain", "utf-8"))
        message.attach(MIMEText(html, "html", "utf-8"))

        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.send_message(message)

    @staticmethod
    def send_reset_password_email(user, token: str):
        reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
        
        template = env.get_template("reset_password.html")
        html = template.render(name=user.name, reset_link=reset_link)
        
        # Fallback plain text version
        plain_text = (
            f"Hello {user.name},\n\n"
            f"We received a request to reset your password.\n"
            f"Use the following link to reset your password (expires in 15 minutes):\n"
            f"{reset_link}\n\n"
            f"If you didn't request this, please ignore this email."
        )

        EmailService.send_email(
            recipient=user.email,
            subject="Reset Your Password",
            html=html,
            plain_text=plain_text
        )

    @staticmethod
    def send_verification_email(user, token: str):
        verification_link = f"{FRONTEND_URL}/verify-email?token={token}"
        
        template = env.get_template("verify_email.html")
        html = template.render(name=user.name, verification_link=verification_link)

        plain_text = (
            f"Hello {user.name},\n\n"
            f"Please verify your email address by clicking the link below:\n"
            f"{verification_link}\n\n"
            f"If you did not sign up, please ignore this email."
        )

        EmailService.send_email(
            recipient=user.email,
            subject="Verify Your Email Address",
            html=html,
            plain_text=plain_text
        )