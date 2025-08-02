# Database Maintenance Guide

This guide provides information on maintaining and monitoring the MongoDB database for the AI Interview Application.

## Regular Maintenance Tasks

### 1. Database Backups

Regular backups are essential for data protection. The application includes a utility script for managing backups:

```bash
# Create a backup
node utils/db-utils.js backup

# List available backups
node utils/db-utils.js list

# Restore from a backup
node utils/db-utils.js restore <backup-path>
```

Recommended backup schedule:

- Daily backups for production environments
- Weekly backups for development environments
- Keep backups for at least 30 days

### 2. Index Maintenance

The application's MongoDB models include appropriate indexes to improve query performance. Periodically analyze index usage to ensure optimal performance:

```javascript
// MongoDB shell command to check index usage
db.collection.aggregate([{ $indexStats: {} }])

// Check index size
db.collection.stats().indexSizes
```

### 3. Database Monitoring

#### Local Environment

For local monitoring, you can use MongoDB Compass to:

- Visualize query performance
- Examine database statistics
- Analyze index usage
- Monitor database size

#### Production Environment (MongoDB Atlas)

MongoDB Atlas provides built-in monitoring tools:

- Real-time server monitoring
- Custom alerts for performance thresholds
- Slow query analysis
- Database metrics and logs

## Performance Optimization

### 1. Query Optimization

- Use the MongoDB query profiler to identify slow queries:

  ```javascript
  // Enable profiler for queries taking longer than 100ms
  db.setProfilingLevel(1, { slowms: 100 })
  
  // Check slow queries
  db.system.profile.find().sort({ts:-1})
  ```

- Review controller code regularly to ensure efficient query patterns
- Avoid large document sizes that exceed 16MB limit
- Use pagination for large result sets

### 2. Connection Pooling

The application uses MongoDB connection pooling as configured in `config/db.js`. Default settings:

- Minimum pool size: 5
- Maximum pool size: 10

Adjust these settings based on your application's traffic patterns.

## Troubleshooting Common Issues

### Connection Issues

1. Check network connectivity to MongoDB server
2. Verify correct connection string in `.env` file
3. Ensure IP whitelist includes your server's IP address
4. Check MongoDB server logs for authentication failures

### Performance Issues

1. Review indexes for frequently used queries
2. Check for missing indexes on commonly queried fields
3. Analyze slow operations using MongoDB profiler
4. Consider increasing MongoDB Atlas tier if using cloud hosting

### Data Consistency Issues

1. Ensure proper validation in application models
2. Use transactions for operations that modify multiple documents
3. Implement retry logic for network-related failures

## Database Security Best Practices

1. Use strong, unique passwords for database users
2. Enable MongoDB authentication
3. Restrict network access using IP whitelisting
4. Apply principle of least privilege to database users
5. Encrypt sensitive data at rest and in transit
6. Regularly audit database access and operations
