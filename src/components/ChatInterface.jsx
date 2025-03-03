import React, { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css"; // Choose a theme

const ChatInterface = ({ messages, inputValue, onInputChange, onSend, isSending }) => {
    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (textAreaRef.current) {
            textAreaRef.current.style.height = "auto";
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        // Apply syntax highlighting after new messages are rendered
        hljs.highlightAll();
    }, [messages]); // Runs whenever messages change

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    // Configure marked to use highlight.js
    marked.setOptions({
        highlight: (code, lang) => {
            return lang && hljs.getLanguage(lang)
                ? hljs.highlight(code, { language: lang }).value
                : hljs.highlightAuto(code).value;
        },
        breaks: true, // Support line breaks
        gfm: true, // Enable GitHub Flavored Markdown
    });

    const renderMessage = (text) => {
        const parts = text.split(/<\/?think>/g); // Split by <think> and </think>

        return parts
            .map((part, index) => {
                const trimmedPart = part.trim();
                if (index % 2 === 1 && trimmedPart === "") {
                    return null; // Skip rendering empty <think> tags
                }
                return index % 2 === 1 ? (
                    // Markdown inside <think> tags with code highlighting
                    <div
                        key={index}
                        className="bg-gray-700 text-gray-300 italic px-2 py-1 rounded-md inline-block mb-5"
                        dangerouslySetInnerHTML={{ __html: marked.parse(trimmedPart) }}
                    />
                ) : (
                    // Markdown outside <think> tags with code highlighting
                    <span key={index} dangerouslySetInnerHTML={{ __html: marked.parse(part) }} />
                );
            })
            .filter(Boolean); // Remove null values
    };

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-3xl p-4 rounded-lg ${message.isUser ? "bg-blue-600 ml-20" : "bg-gray-800 mr-20"}`}>
                            <p className="text-white">{renderMessage(message.text)}</p>
                            <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-700">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <textarea
                        ref={textAreaRef}
                        value={inputValue}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message... (Shift + Enter for new line)"
                        className="flex-1 p-3 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-48"
                        rows={1}
                        disabled={isSending}
                    />
                    <button
                        onClick={onSend}
                        className="bg-blue-600 hover:bg-blue-700 p-3 rounded-lg h-[44px] w-20 flex items-center justify-center"
                        disabled={isSending}
                    >
                        {isSending ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : (
                            "Send"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
