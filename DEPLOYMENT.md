# Kanghan Valley Resort & Camping - Deployment Guide

## 🚀 Quick Setup (VPS Ubuntu)

### Prerequisites
- Ubuntu 20.04/22.04 LTS VPS
- Root or sudo access
- Domain name (kanghan.site) pointed to your server IP

### One-Command Setup

```bash
# Download and run setup script
curl -o setup-vps.sh https://raw.githubusercontent.com/tay1862/app_kanghan/main/setup-vps.sh
chmod +x setup-vps.sh
sudo ./setup-vps.sh
```

The script will:
1. ✅ Install Node.js 20.x
2. ✅ Install MySQL and create database
3. ✅ Install yt-dlp (for music module)
4. ✅ Install PM2 (process manager)
5. ✅ Install Nginx (web server)
6. ✅ Install Certbot (SSL certificates)
7. ✅ Clone repository
8. ✅ Install dependencies
9. ✅ Setup database
10. ✅ Build application
11. ✅ Configure Nginx
12. ✅ Start application with PM2

---

## 📋 Manual Setup (Step by Step)

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install yt-dlp
sudo apt install -y yt-dlp

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Configure MySQL

```bash
# Login to MySQL
sudo mysql

# Run these commands in MySQL:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YOUR_MYSQL_ROOT_PASSWORD';
CREATE DATABASE kanghan;
CREATE USER 'kanghan'@'localhost' IDENTIFIED BY 'YOUR_DB_PASSWORD';
GRANT ALL PRIVILEGES ON kanghan.* TO 'kanghan'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone Repository

```bash
# Create app directory
sudo mkdir -p /var/www/kanghan
cd /var/www/kanghan

# Clone repository
sudo git clone https://github.com/tay1862/app_kanghan.git .

# Install dependencies
sudo npm install
```

### 4. Configure Environment

```bash
# Create .env file
sudo nano .env
```

Add the following (update YOUR_* values):

```env
DATABASE_URL="mysql://kanghan:YOUR_DB_PASSWORD@localhost:3306/kanghan"
NEXTAUTH_URL="https://app.kanghan.site"
NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
YTDLP_PATH="/usr/bin/yt-dlp"
UPLOAD_DIR="/var/www/kanghan/public/uploads"
NODE_ENV="production"
APP_HOST="app.kanghan.site"
MENU_HOST="menu.kanghan.site"
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 5. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npm run db:seed
```

### 6. Build Application

```bash
npm run build
```

### 7. Start with PM2

```bash
# Start application
pm2 start npm --name "kanghan" -- start

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### 8. Configure Nginx

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/kanghan
```

Add this configuration:

```nginx
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
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kanghan /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 9. Configure Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 10. Setup SSL (After DNS Propagation)

```bash
# Install SSL certificates
sudo certbot --nginx -d app.kanghan.site -d menu.kanghan.site

# Auto-renewal is configured automatically
```

---

## 🌐 DNS Configuration

Point these DNS records to your VPS IP address:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | YOUR_SERVER_IP | 3600 |
| A | app | YOUR_SERVER_IP | 3600 |
| A | menu | YOUR_SERVER_IP | 3600 |

Or using full domains:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | kanghan.site | YOUR_SERVER_IP | 3600 |
| A | app.kanghan.site | YOUR_SERVER_IP | 3600 |
| A | menu.kanghan.site | YOUR_SERVER_IP | 3600 |

---

## ➕ Adding New Subdomains

### Example: Adding `booking.kanghan.site`

#### 1. Update DNS
Add A record:
```
A  booking  YOUR_SERVER_IP
```

#### 2. Update Nginx Config

```bash
sudo nano /etc/nginx/sites-available/kanghan
```

Add new server block:

```nginx
# Booking subdomain
server {
    listen 80;
    server_name booking.kanghan.site;

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
```

#### 3. Test and Reload Nginx

```bash
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. Add SSL Certificate

```bash
sudo certbot --nginx -d booking.kanghan.site
```

#### 5. Update Application (if needed)

If you need to handle the subdomain differently in your app, update `src/middleware.ts`:

```typescript
const bookingHost = process.env.BOOKING_HOST || "booking.kanghan.site";

if (hostname === bookingHost || hostname.startsWith("booking.")) {
  // Custom routing logic for booking subdomain
  const url = request.nextUrl.clone();
  url.pathname = `/booking${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}
```

And add to `.env`:
```env
BOOKING_HOST="booking.kanghan.site"
```

---

## 🔧 Useful Commands

### PM2 Management
```bash
pm2 status              # Check status
pm2 logs kanghan        # View logs
pm2 restart kanghan     # Restart app
pm2 stop kanghan        # Stop app
pm2 start kanghan       # Start app
pm2 delete kanghan      # Delete app from PM2
```

### Application Updates
```bash
cd /var/www/kanghan
git pull                # Pull latest code
npm install             # Install new dependencies
npx prisma generate     # Regenerate Prisma client
npx prisma db push      # Update database schema
npm run build           # Rebuild app
pm2 restart kanghan     # Restart app
```

### Database Management
```bash
# Backup database
mysqldump -u kanghan -p kanghan > backup.sql

# Restore database
mysql -u kanghan -p kanghan < backup.sql

# Access Prisma Studio (development only)
npx prisma studio
```

### Nginx Management
```bash
sudo nginx -t                    # Test config
sudo systemctl restart nginx     # Restart
sudo systemctl reload nginx      # Reload (no downtime)
sudo systemctl status nginx      # Check status
```

### SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

---

## 🔐 Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `Te1862005`

**Staff Account:**
- Username: `staff`
- Password: `staff123`

⚠️ **Change these passwords immediately after first login!**

---

## 📊 System Requirements

- **OS:** Ubuntu 20.04/22.04 LTS
- **RAM:** Minimum 2GB (4GB recommended)
- **Storage:** Minimum 20GB
- **Node.js:** 20.x
- **MySQL:** 8.0+
- **Nginx:** Latest stable

---

## 🆘 Troubleshooting

### Application won't start
```bash
pm2 logs kanghan        # Check logs
pm2 restart kanghan     # Restart
```

### Database connection error
```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u kanghan -p
```

### Nginx 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Renew certificates
sudo certbot renew
```

---

## 📝 Notes

- Music module requires `yt-dlp` to be installed
- Upload directory is `/var/www/kanghan/public/uploads`
- Application runs on port 3009
- Nginx proxies requests from port 80/443 to 3009
- PM2 ensures app restarts on crashes and server reboots
