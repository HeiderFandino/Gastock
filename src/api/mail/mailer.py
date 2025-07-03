from flask_mail import Message
from api.mail.mail_config import mail

import os

def send_reset_email(address, token):
    try:
        # URL del frontend
        frontend_url = "https://congenial-space-halibut-4jwx9rr9jv6gfp99-3000.app.github.dev"
        reset_url = f"{frontend_url}/reset?token={token}"
        print("FRONTEND URL:", frontend_url)
        print("RESET URL:", reset_url)
        print("Enviando a:", address)
        # Crear el mensaje
        msg = Message(
            subject="Restablece tu contraseña",
            recipients=[address],
            html=f"""
                <p>Haz clic aquí para restablecer tu contraseña:</p>
                <a href="{reset_url}">Restablecer contraseña</a>
            """
        )
        # Enviar el mensaje
        mail.send(msg)
        print("Correo enviado correctamente a:", address)
        return {'success': True, 'msg': 'Correo enviado con éxito'}
    except Exception as e:
        print("Error enviando el correo:", str(e))
        return {'success': False, 'msg': str(e)}





























































