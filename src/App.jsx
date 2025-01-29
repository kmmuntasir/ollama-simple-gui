import React, { useState, useEffect, useRef } from 'react';

const ChatInterface = () => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [selectedChat, setSelectedChat] = useState(null);

    const textAreaRef = useRef(null);
    const messagesEndRef = useRef(null); // Ref for scrolling to the bottom

    useEffect(() => {
        if (textAreaRef.current) {
            // Adjust the height to fit the content
            textAreaRef.current.style.height = 'auto';
            textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
        }
    }, [inputValue]);

    useEffect(() => {
        // Scroll to the bottom whenever a new message or response is added
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]); // Trigger this effect whenever the messages array changes

    const handleSend = async () => {
        const trimmedValue = inputValue.trim();
        if (trimmedValue) {
            // Add user message
            const newMessage = {
                id: messages.length + 1,
                text: trimmedValue,
                isUser: true,
                timestamp: new Date().toLocaleTimeString(),
            };
            setMessages([...messages, newMessage]);
            setInputValue('');

            try {
                // Send request to API
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'deepseek-coder:1.3b',
                        prompt: `${trimmedValue} Respond in JSON`,
                        stream: false,
                        format: {
                            type: 'object',
                            properties: {
                                answer: { type: 'string' },
                            },
                            required: ['answer'],
                        },
                    }),
                });

                const data = await response.json();

                // Extract the answer and timestamp
                const botResponse = {
                    id: messages.length + 2,
                    text: JSON.parse(data.response).answer,
                    isUser: false,
                    timestamp: new Date(data.created_at).toLocaleTimeString(),
                };

                // Add bot response to the chat
                setMessages((prev) => [...prev, botResponse]);
            } catch (error) {
                console.error('Error fetching the response:', error);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Left Sidebar (unchanged) */}
            <div className="w-64 bg-gray-800 p-4 border-r border-gray-700">
                <div className="mb-4">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg">
                        New Chat
                    </button>
                </div>
                <div className="space-y-2">
                    {[1, 2, 3].map((chat) => (
                        <div
                            key={chat}
                            className={`p-3 rounded-lg cursor-pointer hover:bg-gray-700 ${
                                selectedChat === chat ? 'bg-gray-700' : ''
                            }`}
                            onClick={() => setSelectedChat(chat)}
                        >
                            Chat History {chat}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-3xl p-4 rounded-lg ${
                                    message.isUser
                                        ? 'bg-blue-600 ml-20'
                                        : 'bg-gray-800 mr-20'
                                }`}
                            >
                                <p className="whitespace-pre-wrap">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} /> {/* This element will scroll into view */}
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
