export default async function handler(req, res) {
    let apiUrl = "http://localhost:11434/api";

    try {
        if (req.method === "GET") {
            // Fetch available models
            const response = await fetch(`${apiUrl}/tags`);
            const data = await response.json();
            return res.status(response.status).json(data);
        }

        if (req.method === "POST") {
            const { action, model } = req.body;

            if (action === "download") {
                // Download model
                const response = await fetch(`${apiUrl}/pull`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ model, stream: false }),
                });

                const data = await response.json();
                return res.status(response.status).json(data);
            }

            if (action === "generate") {
                // Generate response (chat)
                const response = await fetch(`${apiUrl}/generate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(req.body),
                });

                const data = await response.json();
                return res.status(response.status).json(data);
            }
        }

        if (req.method === "DELETE") {
            const { model } = req.body;

            // Delete model
            const response = await fetch(`${apiUrl}/delete`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model }),
            });

            const data = await response.json();
            return res.status(response.status).json(data);
        }

        res.status(405).json({ error: "Method Not Allowed" });
    } catch (error) {
        console.error("Ollama Middleware Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
