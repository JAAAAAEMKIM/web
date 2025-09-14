#!/usr/bin/env node

/**
 * Health Check Script for Docker Containers
 * Used by Docker and monitoring systems to verify application health
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:3000/api/health';
const TIMEOUT = parseInt(process.env.HEALTH_TIMEOUT || '10000'); // 10 seconds
const MAX_RETRIES = parseInt(process.env.HEALTH_RETRIES || '3');
const RETRY_DELAY = parseInt(process.env.HEALTH_RETRY_DELAY || '2000'); // 2 seconds

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function makeHealthRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: TIMEOUT,
      headers: {
        'User-Agent': 'Docker-Health-Check/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: { status: 'unknown', raw: data }
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${TIMEOUT}ms`));
    });

    req.end();
  });
}

async function checkHealth(attempt = 1) {
  try {
    log(`Health check attempt ${attempt}/${MAX_RETRIES}...`, colors.blue);
    
    const response = await makeHealthRequest(HEALTH_URL);
    
    if (response.statusCode === 200) {
      const health = response.body;
      
      if (health.status === 'healthy') {
        log('✓ Application is healthy', colors.green);
        log(`  Database: ${health.database}`, colors.green);
        log(`  Uptime: ${health.uptime}s`, colors.green);
        
        if (health.memory) {
          log(`  Memory: ${health.memory.heapUsed}/${health.memory.heapTotal}MB`, colors.green);
        }
        
        return true;
      } else {
        log('✗ Application reports unhealthy status', colors.red);
        log(`  Status: ${health.status}`, colors.red);
        log(`  Database: ${health.database || 'unknown'}`, colors.red);
        
        if (health.error) {
          log(`  Error: ${health.error}`, colors.red);
        }
        
        return false;
      }
    } else {
      log(`✗ HTTP ${response.statusCode}: Health endpoint returned non-200 status`, colors.red);
      return false;
    }
  } catch (error) {
    log(`✗ Health check failed: ${error.message}`, colors.red);
    
    if (attempt < MAX_RETRIES) {
      log(`  Retrying in ${RETRY_DELAY/1000}s...`, colors.yellow);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return checkHealth(attempt + 1);
    }
    
    return false;
  }
}

async function main() {
  log(`Docker Health Check for ${HEALTH_URL}`, colors.blue);
  log(`Timeout: ${TIMEOUT}ms, Max retries: ${MAX_RETRIES}`, colors.blue);
  console.log('');
  
  const isHealthy = await checkHealth();
  
  if (isHealthy) {
    log('\n✓ Health check passed', colors.green);
    process.exit(0);
  } else {
    log('\n✗ Health check failed', colors.red);
    process.exit(1);
  }
}

// Handle signals gracefully
process.on('SIGINT', () => {
  log('\nHealth check interrupted', colors.yellow);
  process.exit(130);
});

process.on('SIGTERM', () => {
  log('\nHealth check terminated', colors.yellow);
  process.exit(143);
});

// Run the health check
main().catch((error) => {
  log(`Unexpected error: ${error.message}`, colors.red);
  process.exit(1);
});