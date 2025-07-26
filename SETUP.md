# Setup Guide for Voting System

## 1. Create Environment File

Create a file named `.env.local` in the root directory with the following content:

```env
# MongoDB Connection String
# For local development, use MongoDB Community Server or MongoDB Atlas
MONGODB_URI=mongodb://localhost:27017/voting-system

# JWT Secret Key (change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: MongoDB Atlas connection string (uncomment and replace with your Atlas URI)
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting-system?retryWrites=true&w=majority
```

## 2. MongoDB Setup Options

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server:**

   - Download from: https://www.mongodb.com/try/download/community
   - Install and start the MongoDB service

2. **Or use Docker:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

### Option B: MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account:**

   - Go to: https://www.mongodb.com/atlas
   - Create a free cluster

2. **Get Connection String:**

   - In Atlas dashboard, click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

3. **Update .env.local:**

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting-system?retryWrites=true&w=majority
   ```

4. **Whitelist Your IP:**
   - In Atlas dashboard, go to "Network Access"
   - Add your current IP address to the whitelist

## 3. Start the Application

```bash
npm run dev
```

The application will be available at: http://localhost:3000 (or 3001 if 3000 is busy)

## 4. Create Admin User

After the application is running, you can create an admin user by:

1. Go to: http://localhost:3000/?mode=register
2. Register with role "voter" (you can change this in the database later)
3. Or use the API directly to create an admin user

## 5. Troubleshooting

### MongoDB Connection Issues:

- Make sure MongoDB is running locally: `mongod`
- Check if port 27017 is available
- For Atlas: Ensure your IP is whitelisted

### Environment Variables:

- Make sure `.env.local` is in the root directory
- Restart the development server after creating the file

### Port Issues:

- If port 3000 is busy, the app will automatically use 3001
- Check the terminal output for the correct URL
