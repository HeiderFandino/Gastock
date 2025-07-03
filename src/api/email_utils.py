import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_email(to_email, subject, html_content):
    try:
        message = Mail(
            from_email=os.getenv("EMAIL_SENDER"),
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )

        sg = SendGridAPIClient(os.getenv("SENDGRID_API_KEY"))
        response = sg.send(message)
        print("Correo enviado:", response.status_code)
        return True
    except Exception as e:
        print("Error al enviar correo:", e)
        return False
