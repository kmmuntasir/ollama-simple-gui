import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatInterface from "./components/ChatInterface";
import models from "./constants/models.js";

const App = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedModel, setSelectedModel] = useState(models.find(m => m.model_identifier === "deepseek-r1"));
    const [selectedLabel, setSelectedLabel] = useState("1.5b");
    const [availableModels, setAvailableModels] = useState([]);
    const [flashingModel, setFlashingModel] = useState(false);
    const [downloadingModel, setDownloadingModel] = useState(false);

    // Model management effects and functions
    useEffect(() => {
        fetch("http://localhost:11434/api/tags")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.models)) {
                    setAvailableModels(data.models.map(m => m.model));
                }
            })
            .catch(console.error);
    }, []);

    const isModelAvailable = (model, label) => {
        return availableModels.includes(`${model}:${label}`);
    };

    const handleModelChange = (modelIdentifier) => {
        const newModel = models.find(m => m.model_identifier === modelIdentifier);
        setSelectedModel(newModel);
        setSelectedLabel(newModel.labels[0].label);
        triggerFlashEffect();
    };

    const handleLabelChange = (label) => {
        setSelectedLabel(label);
        triggerFlashEffect();
    };

    const handleDownload = async (modelName) => {
        setDownloadingModel(true);
        try {
            await fetch("http://localhost:11434/api/pull", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName, stream: false }),
            });
            setAvailableModels(prev => [...prev, modelName]);
        } catch (error) {
            console.error("Download error:", error);
        } finally {
            setDownloadingModel(false);
        }
    };

    const handleDelete = async (modelName) => {
        try {
            await fetch("http://localhost:11434/api/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName }),
            });
            setAvailableModels(prev => prev.filter(m => m !== modelName));
        } catch (error) {
            console.error("Delete error:", error);
        }
    };

    // Chat functionality
    const handleSend = async () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        const newMessage = {
            id: messages.length + 1,
            text: trimmedValue,
            isUser: true,
            timestamp: new Date().toLocaleTimeString(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");

        try {
            const response = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: `${selectedModel.model_identifier}:${selectedLabel}`,
                    prompt: `${trimmedValue} Respond in JSON`,
                    stream: false,
                    format: {
                        type: "object",
                        properties: { answer: { type: "string" } },
                        required: ["answer"],
                    },
                }),
            });

            const data = await response.json();
            const botResponse = {
                id: messages.length + 2,
                text: JSON.parse(data.response).answer,
                isUser: false,
                timestamp: new Date(data.created_at).toLocaleTimeString(),
            };

            setMessages(prev => [...prev, botResponse]);
        } catch (error) {
            console.error("API error:", error);
        }
    };

    const triggerFlashEffect = () => {
        setFlashingModel(true);
        setTimeout(() => setFlashingModel(false), 1000);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Sidebar
                models={models}
                selectedModel={selectedModel}
                selectedLabel={selectedLabel}
                availableModels={availableModels}
                flashingModel={flashingModel}
                downloadingModel={downloadingModel}
                onModelChange={handleModelChange}
                onLabelChange={handleLabelChange}
                onDownload={handleDownload}
                onDelete={handleDelete}
                isModelAvailable={isModelAvailable}
            />

            <ChatInterface
                messages={messages}
                inputValue={inputValue}
                onInputChange={setInputValue}
                onSend={handleSend}
                isSending={messages.length % 2 !== 0}
            />
        </div>
    );
};

export default App;