from email.mime.text import MIMEText
import smtplib
from typing import Optional

from app.core.config import get_settings


def send_email(subject: str, body: str, to_email: str) -> Optional[str]:
    settings = get_settings()
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASS and settings.SMTP_FROM):
        return "SMTP not configured"

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to_email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT or 587) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASS)
            server.sendmail(msg["From"], [msg["To"]], msg.as_string())
        return None
    except Exception as e:
        return str(e)
