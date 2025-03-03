import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import Notification from "./components/Notification";
import models from "./constants/models.js";

const App = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedModel, setSelectedModel] = useState(models.find(m => m.model_identifier === "deepseek-r1"));
    const [selectedLabel, setSelectedLabel] = useState("1.5b");
    const [availableModels, setAvailableModels] = useState([]);
    const [flashingModel, setFlashingModel] = useState(false);
    const [downloadingModel, setDownloadingModel] = useState(false);
    const [error, setError] = useState(null);

    // Fetch available models on mount
    useEffect(() => {
        fetch("/api/ollama/tags")
            .then(async (res) => {
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(`${errorData.error} (${res.statusText})`);
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data.models)) {
                    setAvailableModels(data.models.map(m => m.model));
                }
            })
            .catch(error => {
                setError(error.message);
            });
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
            const response = await fetch("/api/ollama/pull", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName, stream: false }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.error} (${response.statusText})`);
            }

            setAvailableModels(prev => [...prev, modelName]);
        } catch (error) {
            setError(error.message);
        } finally {
            setDownloadingModel(false);
        }
    };

    const handleDelete = async (modelName) => {
        try {
            const response = await fetch("/api/ollama/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.error} (${response.statusText})`);
            }

            setAvailableModels(prev => prev.filter(m => m !== modelName));
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSend = async () => {
        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        // Add user message
        const newMessage = {
            id: messages.length + 1,
            text: trimmedValue,
            isUser: true,
            timestamp: new Date().toLocaleTimeString(),
        };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");

        // Add temporary bot message for streaming
        const botMessageId = messages.length + 2;
        setMessages(prev => [
            ...prev,
            {
                id: botMessageId,
                text: "",
                isUser: false,
                timestamp: new Date().toLocaleTimeString(),
            },
        ]);

        try {
            const response = await fetch("/api/ollama/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: `${selectedModel.model_identifier}:${selectedLabel}`,
                    prompt: trimmedValue,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`${errorData.error} (${response.statusText})`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // Process complete JSON objects in the buffer
                let boundary;
                while ((boundary = buffer.indexOf('\n')) >= 0) {
                    const chunk = buffer.slice(0, boundary);
                    buffer = buffer.slice(boundary + 1);

                    if (chunk.trim()) {
                        try {
                            const data = JSON.parse(chunk);
                            setMessages(prev => prev.map(msg =>
                                msg.id === botMessageId
                                    ? { ...msg, text: msg.text + data.response }
                                    : msg
                            ));
                        } catch (error) {
                            console.error("Error parsing chunk:", error);
                        }
                    }
                }
            }

            // Final update with remaining buffer
            if (buffer.trim()) {
                try {
                    const data = JSON.parse(buffer);
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMessageId
                            ? { ...msg, text: msg.text + data.response }
                            : msg
                    ));
                } catch (error) {
                    console.error("Error parsing final chunk:", error);
                }
            }

        } catch (error) {
            console.error("Chat error:", error);
            setError(error.message);
            // Remove temporary bot message if error occurs
            setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
        }
    };

    const triggerFlashEffect = () => {
        setFlashingModel(true);
        setTimeout(() => setFlashingModel(false), 1000);
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            <Notification error={error} onDismiss={() => setError(null)} />

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