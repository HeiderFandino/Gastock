from flask_mail import Message
from api.mail.mail_config import mail

import os

def send_reset_email(address, token):
    try:
        # URL del frontend
        frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset?token={token}"
        print("FRONTEND URL:", frontend_url)
        print("RESET URL:", reset_url)
        print("Enviando a:", address)
        # Crear el mensaje
        sender_email = os.getenv('EMAIL_USER')
        print(f"Usando sender: {sender_email}")

        if not sender_email:
            print("ERROR: EMAIL_USER no está configurado")
            return {'success': False, 'msg': 'Configuración de email faltante'}

        msg = Message(
            subject="🔑 Restablece tu contraseña de Gastock",
            recipients=[address],
            sender=sender_email,
            html=f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                    <div style="background: linear-gradient(180deg, #0d2a55 0%, #0b1d3a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">🔧 Gastock</h1>
                        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Tu asistente de gestión culinaria</p>
                    </div>

                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #0b1d3a; margin-bottom: 20px;">Restablece tu contraseña</h2>

                        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                            Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
                            Si fuiste tú, haz clic en el botón de abajo para crear una nueva contraseña.
                        </p>

                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_url}" style="background: linear-gradient(180deg, #0d2a55 0%, #0b1d3a 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(11, 29, 58, 0.3);">
                                🔑 Restablecer contraseña
                            </a>
                        </div>

                        <p style="color: #999; font-size: 14px; line-height: 1.5;">
                            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña no se modificará.
                            <br><br>
                            <strong>Este enlace expira en 30 minutos por seguridad.</strong>
                        </p>

                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

                        <p style="color: #999; font-size: 12px; text-align: center;">
                            © 2024 Gastock - Tu gestor culinario de confianza
                        </p>
                    </div>
                </div>
            """
        )
        # Enviar el mensaje
        mail.send(msg)
        print("Correo enviado correctamente a:", address)
        return {'success': True, 'msg': 'Correo enviado con éxito'}
    except Exception as e:
        print("Error enviando el correo:", str(e))
        return {'success': False, 'msg': str(e)}









