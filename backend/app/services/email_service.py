import smtplib
import os

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT"))
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_FROM = os.getenv("EMAIL_FROM")


class EmailService:

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        html_content: str
    ):

        message = MIMEMultipart()

        message["From"] = EMAIL_FROM
        message["To"] = recipient
        message["Subject"] = subject

        message.attach(
            MIMEText(
                html_content,
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