# How to Run

This project is a simple GUI for using ollama APIs, including an optional container to run ollama locally.

1. Clone the repository
2. Make sure you have `make` and `docker` in your system.
3. Make a copy of the `env.example` file and name it `.env`. Fill in the required values (The default values should be 
fine).
4. Run `make start` to start the containers.
5. Access the GUI at [http://localhost:5173](http://localhost:5173).
6. You will see some llama models on the left sidebar. Download any one of them according to your choice.
7. When the download is complete, and the model name is shown in blue color, the model is locally available.
8. Just use the chat interface, and you'll have your own ChatGPT, completely offline.