import os
from flask_mail import Message

from api.mail.mail_config import mail

def send_email(to_email, subject, html_content):
    """Envía un correo usando la configuración SMTP de Flask-Mail."""
    try:
        sender_email = os.getenv("EMAIL_USER")
        if not sender_email:
            print("Error al enviar correo: EMAIL_USER no está configurado")
            return False

        message = Message(
            subject=subject,
            recipients=[to_email],
            sender=sender_email,
            html=html_content,
        )

        mail.send(message)
        print(f"Correo enviado correctamente a {to_email}")
        return True
    except Exception as e:
        print(f"Error al enviar correo a {to_email}: {type(e).__name__}: {e}")
        return False
