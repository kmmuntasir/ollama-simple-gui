import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faDownload, faSpinner } from "@fortawesome/free-solid-svg-icons";
import models from "./constants/models.js";

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [selectedModel, setSelectedModel] = useState(models.find(m => m.model_identifier === "deepseek-coder"));
    const [selectedLabel, setSelectedLabel] = useState("1.3b");
    const [availableModels, setAvailableModels] = useState([]);
    const [flashingModel, setFlashingModel] = useState(false);
    const [downloadingModel, setDownloadingModel] = useState(false);

    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Fetch available models from API on load
    useEffect(() => {
        fetch("http://localhost:11434/api/tags")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data.models)) {
                    setAvailableModels(data.models.map(m => m.model)); // Extract model names
                } else {
                    console.error("Unexpected API response format:", data);
                }
            })
            .catch(error => console.error("Error fetching available models:", error));
    }, []);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const isModelAvailable = (model, label) => {
        return availableModels.includes(`${model}:${label}`);
    };

    const handleModelChange = (event) => {
        const newModel = models.find(m => m.model_identifier === event.target.value);
        setSelectedModel(newModel);
        setSelectedLabel(newModel.labels[0].label); // Default to first available label
        triggerFlashEffect();
    };

    const handleLabelChange = (label) => {
        setSelectedLabel(label);
        triggerFlashEffect();
    };

    const handleDownload = async () => {
        const modelName = `${selectedModel.model_identifier}:${selectedLabel}`;
        if (!window.confirm(`Are you sure you want to download ${modelName}?`)) return;

        setDownloadingModel(true); // Start the downloading process
        try {
            const response = await fetch("http://localhost:11434/api/pull", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName, stream: false }),
            });
            const data = await response.json();
            if (data.status === "success") {
                setAvailableModels(prev => [...prev, modelName]);
            }
        } catch (error) {
            console.error("Error downloading model:", error);
        } finally {
            setDownloadingModel(false); // End the downloading process
        }
    };

    const handleDelete = async () => {
        const modelName = `${selectedModel.model_identifier}:${selectedLabel}`;
        if (!window.confirm(`Are you sure you want to delete ${modelName}?`)) return;

        try {
            const response = await fetch("http://localhost:11434/api/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: modelName }),
            });
            if (response.ok) {
                setAvailableModels(prev => prev.filter(m => m !== modelName));
            }
        } catch (error) {
            console.error("Error deleting model:", error);
        }
    };

    const handleSend = async () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            const newMessage = {
                id: messages.length + 1,
                text: trimmedValue,
                isUser: true,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([...messages, newMessage]);
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

                setMessages((prev) => [...prev, botResponse]);
            } catch (error) {
                console.error("Error fetching the response:", error);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const triggerFlashEffect = () => {
        setFlashingModel(true);
        setTimeout(() => setFlashingModel(false), 1000); // Flash for 1 second
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar with Selected Model */}
            <div className="w-64 bg-gray-800 p-4 border-r border-gray-700 flex flex-col">
                {/* Model Selection Dropdown */}
                <select
                    className="bg-gray-700 text-white p-2 rounded mb-4 focus:ring-2 focus:ring-blue-500"
                    onChange={handleModelChange}
                    value={selectedModel.model_identifier}
                >
                    {models.map((model) => (
                        <option key={model.model_identifier} value={model.model_identifier}>
                            {model.model_identifier}
                        </option>
                    ))}
                </select>

                {/* Selected Model Info */}
                <div className="bg-gray-700 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold text-blue-500">{selectedModel.model_identifier}</h3>
                    <p className="text-sm text-gray-300 mt-2">{selectedModel.description}</p>

                    {/* Label Selection Buttons */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {selectedModel.labels?.map((label) => {
                            const modelLabel = `${selectedModel.model_identifier}:${label.label}`;
                            const available = isModelAvailable(selectedModel.model_identifier, label.label);

                            return (
                                <div key={label.label} className="flex items-center gap-2">
                                    <button
                                        className={`px-3 py-1 rounded-lg text-sm ${selectedLabel === label.label && available ? "bg-blue-600 text-white" : "bg-gray-600 text-gray-200"} ${available ? "hover:bg-gray-500" : "cursor-not-allowed opacity-50"}`}
                                        onClick={() => available && handleLabelChange(label.label)}
                                        disabled={!available || selectedLabel === label.label}
                                    >
                                        {label.label} ({label.size})
                                    </button>

                                    {/* Icons for Download/Delete */}
                                    {available ? (
                                        <button
                                            onClick={handleDelete}
                                            className="bg-red-600 hover:bg-red-700 px-2 py-1 text-sm rounded"
                                            title="Delete Model"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleDownload}
                                            className="bg-green-600 hover:bg-green-700 px-2 py-1 text-sm rounded"
                                            title="Download Model"
                                            disabled={downloadingModel}
                                        >
                                            {downloadingModel ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faDownload} />}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Flashing Model Identifier */}
                <div
                    className={`mt-auto text-center text-sm py-2 bg-gray-700 rounded ${flashingModel ? "animate-flash bg-gray-800" : "text-white"}`}
                >
                    Selected Model {!isModelAvailable(selectedModel.model_identifier, selectedLabel) && (<span>(UNAVAILABLE)</span>)}:<br />
                    <code>{`${selectedModel.model_identifier}:${selectedLabel}`}</code>
                </div>
            </div>
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-3xl p-4 rounded-lg ${message.isUser ? "bg-blue-600 ml-20" : "bg-gray-800 mr-20"}`}>
                                <p className="whitespace-pre-wrap">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-700">
                    <div className="max-w-4xl mx-auto flex items-center gap-2">
                        <textarea
                            ref={textAreaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type your message... (Shift + Enter for new line)"
                            className="flex-1 p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-48"
                            rows={1}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg h-[44px]"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
