const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/audit`;

const redirectToLogin = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login";
};

const authFetch = async (url, options = {}) => {
    const token = sessionStorage.getItem("token");
    const config = { ...options };
    config.headers = { ...(options.headers || {}) };

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
        redirectToLogin();
        throw new Error("Sesión expirada");
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error en la petición (${response.status})`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
};

const buildQuery = (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, value);
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : "";
};

const AuditServices = {
    /**
     * Obtiene los logs de auditoría con filtros y paginación
     * @param {Object} params - Parámetros de consulta
     * @param {number} params.page - Página actual (default: 1)
     * @param {number} params.per_page - Elementos por página (default: 50)
     * @param {string} params.action_type - Filtrar por tipo de acción
     * @param {string} params.table_name - Filtrar por tabla
     * @param {number} params.user_id - Filtrar por usuario
     * @param {number} params.restaurante_id - Filtrar por restaurante
     * @param {string} params.date_from - Fecha desde (ISO format)
     * @param {string} params.date_to - Fecha hasta (ISO format)
     * @returns {Promise} Respuesta con los logs paginados
     */
    async getLogs(params = {}) {
        try {
            const query = buildQuery(params);
            return await authFetch(`${API_BASE}/logs${query}`);
        } catch (error) {
            console.error("Error getting audit logs:", error);
            throw error;
        }
    },

    /**
     * Obtiene estadísticas de los logs de auditoría
     * @returns {Promise} Estadísticas de actividad
     */
    async getStats() {
        try {
            return await authFetch(`${API_BASE}/stats`);
        } catch (error) {
            console.error("Error getting audit stats:", error);
            throw error;
        }
    },

    /**
     * Formatea un timestamp para mostrar en la interfaz
     * @param {string} timestamp - Timestamp en formato ISO
     * @returns {string} Fecha formateada
     */
    formatTimestamp(timestamp) {
        return new Date(timestamp).toLocaleString("es-ES", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    },

    /**
     * Formatea un timestamp para mostrar fecha corta
     * @param {string} timestamp - Timestamp en formato ISO
     * @returns {string} Fecha corta formateada
     */
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString("es-ES");
    },

    /**
     * Obtiene el icono correspondiente a un tipo de acción
     * @param {string} actionType - Tipo de acción
     * @returns {string} Icono emoji
     */
    getActionIcon(actionType) {
        const icons = {
            CREATE: "🆕",
            UPDATE: "✏️",
            DELETE: "🗑️",
            LOGIN: "🔐",
            LOGOUT: "🚪",
            VIEW: "👁️"
        };
        return icons[actionType] || "📝";
    },

    /**
     * Obtiene la clase CSS para colorear el tipo de acción
     * @param {string} actionType - Tipo de acción
     * @returns {string} Clase CSS
     */
    getActionColor(actionType) {
        const colors = {
            CREATE: "text-success",
            UPDATE: "text-info",
            DELETE: "text-danger",
            LOGIN: "text-primary",
            LOGOUT: "text-secondary",
            VIEW: "text-muted"
        };
        return colors[actionType] || "text-muted";
    },

    /**
     * Traduce el nombre de una tabla al español
     * @param {string} tableName - Nombre de la tabla
     * @returns {string} Nombre traducido
     */
    translateTableName(tableName) {
        const translations = {
            gastos: "Gastos",
            ventas: "Ventas",
            usuarios: "Usuarios",
            proveedores: "Proveedores",
            restaurantes: "Restaurantes",
            facturas_albaranes: "Facturas/Albaranes",
            margen_objetivo: "Margen Objetivo"
        };
        return translations[tableName] || tableName;
    },

    /**
     * Traduce el tipo de acción al español
     * @param {string} actionType - Tipo de acción
     * @returns {string} Acción traducida
     */
    translateActionType(actionType) {
        const translations = {
            CREATE: "Crear",
            UPDATE: "Actualizar",
            DELETE: "Eliminar",
            LOGIN: "Iniciar Sesión",
            LOGOUT: "Cerrar Sesión",
            VIEW: "Ver"
        };
        return translations[actionType] || actionType;
    },

    /**
     * Genera una descripción legible de la acción
     * @param {Object} log - Log de auditoría
     * @returns {string} Descripción legible
     */
    generateDescription(log) {
        if (log.description) {
            return log.description;
        }

        const action = this.translateActionType(log.action_type);
        const table = this.translateTableName(log.table_name);

        return `${action} en ${table}${log.record_id ? ` (ID: ${log.record_id})` : ''}`;
    }
};

export default AuditServices;
