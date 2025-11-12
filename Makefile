.PHONY: help build push build-push dev up down logs

# Docker image settings
IMAGE_NAME := junho5336/homepage
TAG := latest
PLATFORMS := linux/amd64,linux/arm64

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

build: ## Build Docker image for local use
	docker build -t $(IMAGE_NAME):$(TAG) .

push: ## Push Docker image to Docker Hub (requires prior build)
	docker push $(IMAGE_NAME):$(TAG)

build-push: ## Build multi-platform image and push to Docker Hub
	docker buildx build \
	  --platform $(PLATFORMS) \
	  -t $(IMAGE_NAME):$(TAG) \
	  --push \
	  .

build-local: ## Build for local platform only
	docker buildx build \
	  --load \
	  -t $(IMAGE_NAME):$(TAG) \
	  .

dev: ## Start development server
	npm run dev

up: ## Start containers with docker-compose
	docker-compose up -d

down: ## Stop containers
	docker-compose down

logs: ## Show container logs
	docker-compose logs -f

clean: ## Remove containers and images
	docker-compose down -v
	docker rmi $(IMAGE_NAME):$(TAG) || true
