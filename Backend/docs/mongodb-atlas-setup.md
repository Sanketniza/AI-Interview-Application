# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas for the AI Interview Application.

## What is MongoDB Atlas?

MongoDB Atlas is a fully-managed cloud database service that provides:

- Automated backups
- Monitoring
- Security features
- Scalability options
- Global distribution capabilities

## Step 1: Create a MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" to create a new account or sign in with an existing account
3. Complete the registration process if needed

## Step 2: Create a New Cluster

1. After logging in, click "Build a Cluster"
2. Choose the free "Shared" option for development
3. Select your preferred cloud provider (AWS, GCP, or Azure)
4. Choose a region closest to your application users
5. Click "Create Cluster" and wait for the cluster to be provisioned (5-10 minutes)

## Step 3: Set Up Database Access

1. In the left sidebar, go to "Database Access"
2. Click "Add New Database User"
3. Create a new user with a strong password
   - Username: `aiinterviewapp`
   - Password: Generate a secure password
   - Authentication Method: Password
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
4. Click "Add User"

## Step 4: Configure Network Access

1. In the left sidebar, go to "Network Access"
2. Click "Add IP Address"
3. For development, you can allow access from anywhere by selecting "Allow Access From Anywhere" (not recommended for production)
4. For production, add specific IP addresses or IP ranges
5. Click "Confirm"

## Step 5: Get Your Connection String

1. In the left sidebar, go to "Database" under "Deployment"
2. Click "Connect" for your cluster
3. Select "Connect your application"
4. Choose "Node.js" as your driver and select the appropriate version
5. Copy the provided connection string

## Step 6: Update Environment Variables

1. Open the `.env` file in your project
2. Replace the existing `MONGO_URI` with the connection string from MongoDB Atlas
3. Make sure to replace `<password>` with your actual database user password:

```env
MONGO_URI=mongodb+srv://aiinterviewapp:<password>@cluster0.mongodb.net/aiinterviewapp?retryWrites=true&w=majority
```

## Step 7: Test the Connection

1. Run your application with the updated MongoDB Atlas connection string
2. Verify that the application connects successfully to the database

## Production Considerations

For production environments, consider these additional steps:

1. **Enable Two-Factor Authentication** for your MongoDB Atlas account
2. **Create Separate Users** with limited permissions for production access
3. **IP Whitelisting**: Restrict database access to your application servers only
4. **Enable Database Auditing** to track access and changes
5. **Set Up Alerts** for unusual database activity
6. **Configure Backups** and test restoration procedures
7. **Monitor Performance** and set up alerts for performance issues

## Scaling Options

As your application grows, MongoDB Atlas provides several scaling options:

1. **Vertical Scaling**: Upgrade your cluster tier for more RAM and storage
2. **Horizontal Scaling**: Add shards to distribute data across multiple servers
3. **Read Scaling**: Add read replicas to distribute read operations
4. **Global Clusters**: Distribute data across regions for global availability
