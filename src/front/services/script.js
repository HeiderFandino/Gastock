document.addEventListener('DOMContentLoaded', () => {
    const registerUserForm = document.getElementById('registerUserForm');
    const registerMessage = document.getElementById('registerMessage');
    const usersTableBody = document.querySelector('#usersTable tbody');
    const editUserForm = document.getElementById('editUserForm');
    const editMessage = document.getElementById('editMessage');
    const cancelEditButton = document.getElementById('cancelEdit');

    // **IMPORTANTE: Reemplaza esto con tu token JWT real**
    // En un entorno real, obtendrías este token después de un login exitoso.
    // Por ahora, puedes pegarlo aquí manualmente si lo tienes de Postman.
    const JWT_TOKEN = "TU_TOKEN_JWT_AQUI"; // <--- ¡CÁMBIAME!

    // URL base de tu API (ajusta si es necesario)
    const API_BASE_URL = "http://127.0.0.1:5000/api"; // Asumiendo que tu Flask está en el puerto 5000 y el prefijo /api

    // Función para obtener los usuarios
    async function fetchUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/usuarios`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${JWT_TOKEN}`
                }
            });
            const data = await response.json();

            if (response.ok) {
                renderUsers(data);
            } else {
                console.error("Error al obtener usuarios:", data.error || data.msg);
                alert("Error al cargar usuarios: " + (data.error || data.msg));
            }
        } catch (error) {
            console.error("Error de red al obtener usuarios:", error);
            alert("Error de red al cargar usuarios.");
        }
    }

    // Función para renderizar los usuarios en la tabla
    function renderUsers(users) {
        usersTableBody.innerHTML = ''; // Limpiar la tabla antes de agregar nuevos datos
        users.forEach(user => {
            const row = usersTableBody.insertRow();
            row.insertCell().textContent = user.id;
            row.insertCell().textContent = user.nombre;
            row.insertCell().textContent = user.email;
            row.insertCell().textContent = user.rol;
            row.insertCell().textContent = user.restaurante_id || 'N/A';

            const actionsCell = row.insertCell();
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.classList.add('edit');
            editButton.onclick = () => showEditForm(user);
            actionsCell.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.classList.add('delete');
            deleteButton.onclick = () => deleteUser(user.id);
            actionsCell.appendChild(deleteButton);
        });
    }

    // Manejar el envío del formulario de registro
    registerUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const rol = document.getElementById('registerRol').value;
        const restaurante_id = document.getElementById('registerRestauranteId').value;

        // Validar si rol requiere restaurante_id
        if ((rol === "chef" || rol === "encargado") && !restaurante_id) {
            registerMessage.textContent = "Chef o encargado debe tener un ID de restaurante asignado.";
            registerMessage.classList.add('error-message');
            registerMessage.classList.remove('success-message');
            return;
        }

        const data = {
            nombre,
            email,
            password,
            rol,
            restaurante_id: restaurante_id ? parseInt(restaurante_id) : null // Convertir a número o null
        };

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JWT_TOKEN}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                registerMessage.textContent = result.msg;
                registerMessage.classList.add('success-message');
                registerMessage.classList.remove('error-message');
                registerUserForm.reset(); // Limpiar el formulario
                fetchUsers(); // Actualizar la lista de usuarios
            } else {
                registerMessage.textContent = result.error || result.msg;
                registerMessage.classList.add('error-message');
                registerMessage.classList.remove('success-message');
            }
        } catch (error) {
            console.error("Error al registrar usuario:", error);
            registerMessage.textContent = "Error de red al registrar usuario.";
            registerMessage.classList.add('error-message');
            registerMessage.classList.remove('success-message');
        }
    });

    // Función para mostrar el formulario de edición
    function showEditForm(user) {
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editName').value = user.nombre;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRol').value = user.rol;
        document.getElementById('editRestauranteId').value = user.restaurante_id || '';
        document.getElementById('editPassword').value = ''; // Limpiar la contraseña al editar

        editUserForm.style.display = 'block'; // Mostrar el formulario de edición
        registerUserForm.style.display = 'none'; // Ocultar el formulario de registro
        editMessage.textContent = ''; // Limpiar mensajes
    }

    // Manejar el envío del formulario de edición
    editUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = document.getElementById('editUserId').value;
        const nombre = document.getElementById('editName').value;
        const email = document.getElementById('editEmail').value;
        const password = document.getElementById('editPassword').value;
        const rol = document.getElementById('editRol').value;
        const restaurante_id = document.getElementById('editRestauranteId').value;

        const data = {
            nombre,
            email,
            rol,
            restaurante_id: restaurante_id ? parseInt(restaurante_id) : null
        };

        if (password) { // Solo si se proporciona una nueva contraseña
            data.password = password;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${JWT_TOKEN}`
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();

            if (response.ok) {
                editMessage.textContent = result.msg;
                editMessage.classList.add('success-message');
                editMessage.classList.remove('error-message');
                editUserForm.style.display = 'none'; // Ocultar el formulario de edición
                registerUserForm.style.display = 'block'; // Mostrar el formulario de registro
                fetchUsers(); // Actualizar la lista
            } else {
                editMessage.textContent = result.msg || result.error;
                editMessage.classList.add('error-message');
                editMessage.classList.remove('success-message');
            }
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            editMessage.textContent = "Error de red al actualizar usuario.";
            editMessage.classList.add('error-message');
            editMessage.classList.remove('success-message');
        }
    });

    // Cancelar la edición
    cancelEditButton.addEventListener('click', () => {
        editUserForm.style.display = 'none';
        registerUserForm.style.display = 'block';
        editMessage.textContent = '';
    });

    // Función para eliminar un usuario
    async function deleteUser(id) {
        if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${JWT_TOKEN}`
                }
            });
            const result = await response.json();

            if (response.ok) {
                alert(result.msg);
                fetchUsers(); // Actualizar la lista
            } else {
                alert("Error al eliminar usuario: " + (result.msg || result.error));
            }
        } catch (error) {
            console.error("Error de red al eliminar usuario:", error);
            alert("Error de red al eliminar usuario.");
        }
    }

    // Cargar los usuarios al iniciar la página
    fetchUsers();
});