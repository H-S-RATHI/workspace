#!/bin/bash

# Enhanced Social Media & Marketplace Platform Setup Script

echo "🚀 Setting up Enhanced Social Media & Marketplace Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_success "Node.js is installed: $NODE_VERSION"
    else
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
}

# Check if npm is installed
check_npm() {
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_success "npm is installed: $NPM_VERSION"
    else
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
}

# Check if PostgreSQL is available
check_postgres() {
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client is available"
    else
        print_warning "PostgreSQL client not found. Make sure PostgreSQL is installed and accessible."
    fi
}

# Install backend dependencies
install_backend_deps() {
    print_status "Installing backend dependencies..."
    cd backend
    
    if npm install; then
        print_success "Backend dependencies installed successfully"
    else
        print_error "Failed to install backend dependencies"
        exit 1
    fi
    
    cd ..
}

# Install frontend dependencies
install_frontend_deps() {
    print_status "Installing frontend dependencies..."
    cd frontend
    
    if npm install; then
        print_success "Frontend dependencies installed successfully"
    else
        print_error "Failed to install frontend dependencies"
        exit 1
    fi
    
    cd ..
}

# Setup environment files
setup_env() {
    print_status "Setting up environment configuration..."
    
    # Backend environment
    if [ ! -f "backend/.env" ]; then
        cp backend/.env.example backend/.env
        print_success "Created backend/.env from example"
        print_warning "Please update backend/.env with your actual configuration values"
    else
        print_warning "backend/.env already exists, skipping..."
    fi
    
    # Frontend environment (if needed)
    if [ ! -f "frontend/.env" ]; then
        cat > frontend/.env << EOF
VITE_API_URL=http://localhost:12000
VITE_SOCKET_URL=http://localhost:12000
EOF
        print_success "Created frontend/.env"
    else
        print_warning "frontend/.env already exists, skipping..."
    fi
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    cd backend
    
    # Check if database is accessible
    if npm run migrate; then
        print_success "Database migrations completed successfully"
    else
        print_warning "Database migrations failed. Make sure PostgreSQL is running and configured correctly."
        print_warning "You can run 'npm run migrate' manually in the backend directory later."
    fi
    
    cd ..
}

# Create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p backend/logs
    mkdir -p backend/uploads
    mkdir -p frontend/dist
    
    print_success "Directories created"
}

# Display setup completion message
display_completion() {
    echo ""
    echo "🎉 Setup completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Configure your environment variables in backend/.env"
    echo "   - Database connection (PostgreSQL)"
    echo "   - Cloudinary credentials"
    echo "   - JWT secret"
    echo "   - Email/SMS providers (optional)"
    echo ""
    echo "2. Start the development servers:"
    echo "   Backend:  cd backend && npm run dev"
    echo "   Frontend: cd frontend && npm run dev"
    echo ""
    echo "3. Access the application:"
    echo "   Frontend: http://localhost:12001"
    echo "   Backend API: http://localhost:12000"
    echo ""
    echo "📚 Documentation:"
    echo "   - Enhanced features: ./ENHANCED_FEATURES.md"
    echo "   - API documentation: ./backend/API.md"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "   - Make sure PostgreSQL is running"
    echo "   - Check environment variables in .env files"
    echo "   - Run migrations: cd backend && npm run migrate"
    echo ""
}

# Main setup process
main() {
    echo "Starting setup process..."
    echo ""
    
    # Pre-flight checks
    check_node
    check_npm
    check_postgres
    
    echo ""
    
    # Setup process
    create_directories
    setup_env
    install_backend_deps
    install_frontend_deps
    run_migrations
    
    # Completion
    display_completion
}

# Run main function
main