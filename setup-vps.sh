#!/bin/bash

# Kanghan Valley Resort & Camping - VPS Setup Script
# Ubuntu 20.04/22.04 LTS
# Run as root or with sudo

set -e

echo "=================================="
echo "Kanghan Resort - VPS Setup"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install MySQL
echo "📦 Installing MySQL..."
apt install -y mysql-server

# Secure MySQL installation
echo "🔒 Configuring MySQL..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_MYSQL_ROOT_PASSWORD';"
mysql -e "CREATE DATABASE IF NOT EXISTS kanghan;"
mysql -e "CREATE USER IF NOT EXISTS 'kanghan'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';"
mysql -e "GRANT ALL PRIVILEGES ON kanghan.* TO 'kanghan'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Install yt-dlp for music module
echo "📦 Installing yt-dlp..."
apt install -y yt-dlp

# Install PM2 globally
echo "📦 Installing PM2..."
npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
apt install -y certbot python3-certbot-nginx

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /var/www/kanghan
cd /var/www/kanghan

# Clone repository
echo "📥 Cloning repository..."
if [ -d ".git" ]; then
    git pull
else
    git clone https://github.com/tay1862/app_kanghan.git .
fi

# Install dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
DATABASE_URL="mysql://kanghan:YOUR_DB_PASSWORD@localhost:3306/kanghan"
NEXTAUTH_URL="https://app.kanghan.site"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET_HERE"
YTDLP_PATH="/usr/bin/yt-dlp"
UPLOAD_DIR="/var/www/kanghan/public/uploads"
NODE_ENV="production"
APP_HOST="app.kanghan.site"
MENU_HOST="menu.kanghan.site"
EOF

echo ""
echo "⚠️  IMPORTANT: Edit /var/www/kanghan/.env and update:"
echo "   - YOUR_DB_PASSWORD (same as MySQL password)"
echo "   - YOUR_NEXTAUTH_SECRET_HERE (generate with: openssl rand -base64 32)"
echo ""
read -p "Press Enter after you've updated .env file..."

# Run Prisma migrations
echo "🗄️  Running database migrations..."
npx prisma generate
npx prisma db push

# Seed database
echo "🌱 Seeding database..."
npm run db:seed

# Build application
echo "🏗️  Building Next.js application..."
npm run build

# Setup PM2
echo "🚀 Setting up PM2..."
pm2 delete kanghan 2>/dev/null || true
pm2 start npm --name "kanghan" -- start
pm2 save
pm2 startup

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/kanghan << 'EOF'
# Main domain redirect to app subdomain
server {
    listen 80;
    server_name kanghan.site www.kanghan.site;
    return 301 https://app.kanghan.site$request_uri;
}

# App subdomain
server {
    listen 80;
    server_name app.kanghan.site;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Menu subdomain
server {
    listen 80;
    server_name menu.kanghan.site;

    location / {
        proxy_pass http://localhost:3009;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/kanghan /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
nginx -t

# Restart Nginx
systemctl restart nginx

# Setup firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Point your DNS records to this server IP:"
echo "   - A record: kanghan.site → YOUR_SERVER_IP"
echo "   - A record: app.kanghan.site → YOUR_SERVER_IP"
echo "   - A record: menu.kanghan.site → YOUR_SERVER_IP"
echo ""
echo "2. Install SSL certificates (after DNS propagation):"
echo "   sudo certbot --nginx -d app.kanghan.site -d menu.kanghan.site"
echo ""
echo "3. Access your application:"
echo "   https://app.kanghan.site"
echo "   https://menu.kanghan.site"
echo ""
echo "4. Default login:"
echo "   Username: admin"
echo "   Password: Te1862005"
echo ""
echo "Useful commands:"
echo "  pm2 status          - Check app status"
echo "  pm2 logs kanghan    - View logs"
echo "  pm2 restart kanghan - Restart app"
echo "  pm2 stop kanghan    - Stop app"
echo ""
