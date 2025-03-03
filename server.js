import express from 'express';
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const apiUrl = "http://ollama:11434/api";

// GET: Fetch available models
const getTags = async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/tags`);
        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("GET Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// POST: Handle model download or generation
const generateCompletion = async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Set the appropriate headers for the client
        res.setHeader('Content-Type', 'application/json');

        // Get the ReadableStream from the fetch response
        const reader = response.body.getReader();

        // Forward chunks from the ReadableStream to the client
        while (true) {
            const { done, value } = await reader.read();

            // If the stream is done, end the response
            if (done) {
                res.end();
                break;
            }

            // Write the chunk to the client
            res.write(value);
        }
    } catch (error) {
        console.error("POST Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const downloadModel = async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/pull`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();
        return res.status(response.status).json(data);
    } catch (error) {
        console.error("POST Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteModel = async (req, res) => {
    try {
        const response = await fetch(`${apiUrl}/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(req.body),
        });

        return res.status(response.status).json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("DELETE Request Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// API endpoint
app.get('/api/ollama/tags', getTags);
app.post('/api/ollama/generate', generateCompletion);
app.post('/api/ollama/pull', downloadModel);
app.delete('/api/ollama/delete', deleteModel);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});