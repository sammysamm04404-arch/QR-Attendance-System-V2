import os
import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

from jinja2 import (
    Environment,
    FileSystemLoader,
    select_autoescape
)

load_dotenv()


EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))

EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

EMAIL_FROM = os.getenv("EMAIL_FROM")
FRONTEND_URL = os.getenv("FRONTEND_URL")


BASE_DIR = os.path.dirname(
    os.path.dirname(__file__)
)

TEMPLATE_DIR = os.path.join(
    BASE_DIR,
    "templates"
)

env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html"])
)


class EmailService:

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        html: str
    ):

        message = MIMEMultipart()

        message["From"] = EMAIL_FROM
        message["To"] = recipient
        message["Subject"] = subject

        message.attach(
            MIMEText(
                html,
                "html"
            )
        )

        with smtplib.SMTP(
            EMAIL_HOST,
            EMAIL_PORT
        ) as server:

            server.starttls()

            server.login(
                EMAIL_USERNAME,
                EMAIL_PASSWORD
            )

            server.send_message(message)

    @staticmethod
    def send_reset_password_email(
        user,
        token: str
    ):

        template = env.get_template(
            "reset_password.html"
        )

        html = template.render(
            name=user.name,
            reset_link=f"{FRONTEND_URL}/reset-password?token={token}"
        )

        EmailService.send_email(
            recipient=user.email,
            subject="Reset Your Password",
            html=html
        )

    @staticmethod
    def send_verification_email(
        user,
        token: str
    ):

        template = env.get_template(
            "verify_email.html"
        )

        html = template.render(
            name=user.name,
            verification_link=f"{FRONTEND_URL}/verify-email?token={token}"
        )

        EmailService.send_email(
            recipient=user.email,
            subject="Verify Your Email",
            html=html
        )