SERVICE_NAME="ollamaSimpleGui"

# Just the name
info:
	echo 'Ollama Simple GUI Repository'

# Start the containers
start:
	docker compose up -d

# Stop the containers
stop:
	docker compose down

# Restart the containers
restart: stop start

# Enter the node container
shell:
	docker exec -it ${SERVICE_NAME} bash

# Install dependencies
install:
	docker exec -it ${SERVICE_NAME} npm install

# Run any command
# Example: make command cmd="uname -r"
command:
	docker exec -it ${SERVICE_NAME} ${cmd}

# Run npm command
# Example: make npm cmd="install"
npm:
	docker exec -it ${SERVICE_NAME} npm ${cmd}
