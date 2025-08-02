#!/usr/bin/env node
/**
 * MongoDB Database Utility Script
 * 
 * This script provides utilities for backing up and restoring MongoDB databases
 * for the AI Interview Application.
 * 
 * Usage:
 * - For backup: node db-utils.js backup
 * - For restore: node db-utils.js restore <backup-file>
 */

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Create backups directory if it doesn't exist
const BACKUP_DIR = path.join(__dirname, '../backups');
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Parse MongoDB URI to extract database name
function parseMongoUri(uri) {
  try {
    // Extract database name from MongoDB URI
    const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/);
    if (dbNameMatch && dbNameMatch[1]) {
      return dbNameMatch[1];
    }
    throw new Error('Could not parse database name from MongoDB URI');
  } catch (error) {
    console.error('Error parsing MongoDB URI:', error.message);
    process.exit(1);
  }
}

// Backup MongoDB database
function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dbName = parseMongoUri(process.env.MONGO_URI);
  const backupFilePath = path.join(BACKUP_DIR, `${dbName}-backup-${timestamp}`);

  console.log(`Starting backup of ${dbName} database...`);

  const mongodump = spawn('mongodump', [
    `--uri=${process.env.MONGO_URI}`,
    `--out=${backupFilePath}`
  ]);

  mongodump.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  mongodump.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  mongodump.on('close', (code) => {
    if (code === 0) {
      console.log(`Backup completed successfully: ${backupFilePath}`);
    } else {
      console.error(`Backup process exited with code ${code}`);
    }
  });
}

// Restore MongoDB database from backup
function restoreDatabase(backupPath) {
  if (!backupPath) {
    console.error('Backup path is required for restore operation');
    process.exit(1);
  }

  const fullBackupPath = path.resolve(backupPath);
  if (!fs.existsSync(fullBackupPath)) {
    console.error(`Backup directory not found: ${fullBackupPath}`);
    process.exit(1);
  }

  console.log(`Starting restore from ${fullBackupPath}...`);

  const mongorestore = spawn('mongorestore', [
    `--uri=${process.env.MONGO_URI}`,
    '--drop',
    fullBackupPath
  ]);

  mongorestore.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  mongorestore.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  mongorestore.on('close', (code) => {
    if (code === 0) {
      console.log('Database restore completed successfully');
    } else {
      console.error(`Restore process exited with code ${code}`);
    }
  });
}

// List available backups
function listBackups() {
  console.log('Available backups:');
  
  try {
    const backups = fs.readdirSync(BACKUP_DIR);
    
    if (backups.length === 0) {
      console.log('No backups found');
      return;
    }
    
    backups.forEach((backup, index) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, backup));
      const date = new Date(stats.mtime).toLocaleString();
      console.log(`${index + 1}. ${backup} (created: ${date})`);
    });
  } catch (error) {
    console.error('Error listing backups:', error.message);
  }
}

// Main function to parse arguments and execute commands
function main() {
  const command = process.argv[2];
  
  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI environment variable is not set. Please check your .env file.');
    process.exit(1);
  }
  
  switch (command) {
    case 'backup':
      backupDatabase();
      break;
    case 'restore':
      restoreDatabase(process.argv[3]);
      break;
    case 'list':
      listBackups();
      break;
    default:
      console.log('Usage:');
      console.log('- For backup: node db-utils.js backup');
      console.log('- For restore: node db-utils.js restore <backup-path>');
      console.log('- To list backups: node db-utils.js list');
      process.exit(1);
  }
}

// Execute main function
main();
