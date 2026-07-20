export const readApiResponse = async (response) => {
  const body = await response.text();

  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    console.error(
      `El servidor respondió con contenido no JSON (HTTP ${response.status}).`
    );
    return {
      msg:
        response.status >= 500
          ? "El servidor no pudo completar la solicitud. Inténtalo de nuevo."
          : "El servidor devolvió una respuesta inesperada.",
    };
  }
};
