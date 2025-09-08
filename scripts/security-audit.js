#!/usr/bin/env node

/**
 * Security Audit Script
 * Qatar Airways Stopover AI Agent
 * 
 * This script performs automated security checks on the application
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SecurityAuditor {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
  }

  log(level, message, details = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, details };
    
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (details) {
      console.log('  Details:', details);
    }

    this.results[level === 'error' ? 'failed' : level === 'warn' ? 'warnings' : 'passed'].push(logEntry);
  }

  // Check for hardcoded secrets in code
  checkHardcodedSecrets() {
    console.log('\n🔍 Checking for hardcoded secrets...');
    
    const secretPatterns = [
      /api[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /secret[_-]?key\s*[:=]\s*['"][^'"]+['"]/gi,
      /password\s*[:=]\s*['"][^'"]+['"]/gi,
      /token\s*[:=]\s*['"][^'"]+['"]/gi,
      /sk-[a-zA-Z0-9]{32,}/g, // OpenAI-style keys
      /[a-zA-Z0-9]{32,}/g // Generic long strings
    ];

    const filesToCheck = this.getSourceFiles();
    let secretsFound = false;

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        secretPatterns.forEach((pattern, index) => {
          const matches = content.match(pattern);
          if (matches) {
            // Filter out obvious false positives
            const realSecrets = matches.filter(match => 
              !match.includes('your_api_key_here') &&
              !match.includes('your-api-key') &&
              !match.includes('process.env') &&
              !match.includes('example') &&
              !match.includes('placeholder')
            );

            if (realSecrets.length > 0) {
              this.log('error', `Potential hardcoded secret found in ${file}`, {
                pattern: index,
                matches: realSecrets
              });
              secretsFound = true;
            }
          }
        });
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });

    if (!secretsFound) {
      this.log('info', 'No hardcoded secrets detected');
    }
  }

  // Check environment variable usage
  checkEnvironmentVariables() {
    console.log('\n🔍 Checking environment variable security...');
    
    const requiredEnvVars = [
      'OPENROUTER_API_KEY',
      'DEFAULT_MODEL',
      'ENVIRONMENT',
      'NODE_ENV'
    ];

    const securityEnvVars = [
      'CORS_ORIGINS',
      'RATE_LIMIT_REQUESTS_PER_MINUTE',
      'SECURITY_HEADERS_ENABLED',
      'CSRF_PROTECTION_ENABLED'
    ];

    // Check if .env files exist and warn about them
    const envFiles = ['.env', '.env.local', '.env.development'];
    envFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('warn', `Environment file ${file} found - ensure it's not committed to git`);
        
        // Check if it contains production secrets
        try {
          const content = fs.readFileSync(file, 'utf8');
          if (content.includes('production') || content.includes('prod')) {
            this.log('error', `Production configuration found in ${file} - this should not be committed`);
          }
        } catch (error) {
          this.log('warn', `Could not read ${file}`, error.message);
        }
      }
    });

    // Check for environment variable references in code
    const envVarPattern = /process\.env\.([A-Z_]+)/g;
    const filesToCheck = this.getSourceFiles();
    const usedEnvVars = new Set();

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const matches = content.matchAll(envVarPattern);
        
        for (const match of matches) {
          usedEnvVars.add(match[1]);
        }
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });

    // Check if required variables are used
    requiredEnvVars.forEach(envVar => {
      if (usedEnvVars.has(envVar)) {
        this.log('info', `Required environment variable ${envVar} is properly referenced`);
      } else {
        this.log('warn', `Required environment variable ${envVar} not found in code`);
      }
    });

    // Check if security variables are used
    securityEnvVars.forEach(envVar => {
      if (usedEnvVars.has(envVar)) {
        this.log('info', `Security environment variable ${envVar} is properly referenced`);
      } else {
        this.log('warn', `Security environment variable ${envVar} not found in code`);
      }
    });
  }

  // Check security headers implementation
  checkSecurityHeaders() {
    console.log('\n🔍 Checking security headers implementation...');
    
    const requiredHeaders = [
      'X-XSS-Protection',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];

    // Check if security utility exists
    const securityUtilPath = path.join(__dirname, '../src/utils/security.ts');
    if (!fs.existsSync(securityUtilPath)) {
      this.log('error', 'Security utility file not found');
      return;
    }

    try {
      const securityContent = fs.readFileSync(securityUtilPath, 'utf8');
      
      requiredHeaders.forEach(header => {
        if (securityContent.includes(header)) {
          this.log('info', `Security header ${header} implementation found`);
        } else {
          this.log('error', `Security header ${header} implementation missing`);
        }
      });

      // Check for CSP implementation
      if (securityContent.includes('Content-Security-Policy')) {
        if (securityContent.includes("'unsafe-inline'")) {
          this.log('warn', 'CSP allows unsafe-inline - consider removing for better security');
        }
        if (securityContent.includes("'unsafe-eval'")) {
          this.log('warn', 'CSP allows unsafe-eval - consider removing for better security');
        }
      }

    } catch (error) {
      this.log('error', 'Could not read security utility file', error.message);
    }
  }

  // Check input validation implementation
  checkInputValidation() {
    console.log('\n🔍 Checking input validation implementation...');
    
    const validationPatterns = [
      'sanitizeInput',
      'validateApiRequest',
      'zod',
      'schema',
      'validation'
    ];

    const filesToCheck = this.getSourceFiles();
    let validationFound = false;

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        validationPatterns.forEach(pattern => {
          if (content.toLowerCase().includes(pattern.toLowerCase())) {
            this.log('info', `Input validation pattern '${pattern}' found in ${file}`);
            validationFound = true;
          }
        });
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });

    if (!validationFound) {
      this.log('error', 'No input validation patterns found');
    }

    // Check for dangerous functions
    const dangerousFunctions = [
      'eval(',
      'innerHTML',
      'document.write'
    ];

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        dangerousFunctions.forEach(func => {
          if (content.includes(func)) {
            this.log('warn', `Potentially dangerous function '${func}' found in ${file}`);
          }
        });
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });
  }

  // Check rate limiting implementation
  checkRateLimiting() {
    console.log('\n🔍 Checking rate limiting implementation...');
    
    const rateLimitingPatterns = [
      'rate.?limit',
      'requests.?per.?minute',
      'throttle',
      'checkRateLimit'
    ];

    const filesToCheck = this.getSourceFiles();
    let rateLimitingFound = false;

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        rateLimitingPatterns.forEach(pattern => {
          const regex = new RegExp(pattern, 'gi');
          if (regex.test(content)) {
            this.log('info', `Rate limiting pattern '${pattern}' found in ${file}`);
            rateLimitingFound = true;
          }
        });
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });

    if (!rateLimitingFound) {
      this.log('error', 'No rate limiting implementation found');
    }
  }

  // Check CORS configuration
  checkCorsConfiguration() {
    console.log('\n🔍 Checking CORS configuration...');
    
    const corsPatterns = [
      'Access-Control-Allow-Origin',
      'CORS_ORIGINS',
      'validateCorsOrigin',
      'getCorsHeaders'
    ];

    const filesToCheck = this.getSourceFiles();
    let corsFound = false;

    filesToCheck.forEach(file => {
      try {
        const content = fs.readFileSync(file, 'utf8');
        
        corsPatterns.forEach(pattern => {
          if (content.includes(pattern)) {
            this.log('info', `CORS pattern '${pattern}' found in ${file}`);
            corsFound = true;
          }
        });

        // Check for wildcard CORS (security risk)
        if (content.includes("'*'") && content.includes('Access-Control-Allow-Origin')) {
          this.log('error', 'Wildcard CORS origin detected - security risk');
        }
      } catch (error) {
        this.log('warn', `Could not read file ${file}`, error.message);
      }
    });

    if (!corsFound) {
      this.log('error', 'No CORS configuration found');
    }
  }

  // Check dependency vulnerabilities
  async checkDependencyVulnerabilities() {
    console.log('\n🔍 Checking dependency vulnerabilities...');
    
    const packageJsonPath = path.join(__dirname, '../package.json');
    if (!fs.existsSync(packageJsonPath)) {
      this.log('error', 'package.json not found');
      return;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for known vulnerable packages (simplified check)
      const knownVulnerablePackages = [
        'lodash', // Often has vulnerabilities
        'moment', // Deprecated
        'request', // Deprecated
        'node-sass' // Often has vulnerabilities
      ];

      knownVulnerablePackages.forEach(pkg => {
        if (dependencies[pkg]) {
          this.log('warn', `Potentially vulnerable package detected: ${pkg}`);
        }
      });

      // Check for outdated packages (basic check)
      const outdatedPatterns = [
        /\^0\./,  // Major version 0
        /~0\./,   // Major version 0
        /\^1\./   // Very old major versions for some packages
      ];

      Object.entries(dependencies).forEach(([pkg, version]) => {
        outdatedPatterns.forEach(pattern => {
          if (pattern.test(version)) {
            this.log('warn', `Potentially outdated package: ${pkg}@${version}`);
          }
        });
      });

      this.log('info', `Checked ${Object.keys(dependencies).length} dependencies`);
    } catch (error) {
      this.log('error', 'Could not parse package.json', error.message);
    }
  }

  // Check file permissions and sensitive files
  checkFilePermissions() {
    console.log('\n🔍 Checking file permissions and sensitive files...');
    
    const sensitiveFiles = [
      '.env',
      '.env.local',
      '.env.production',
      'private.key',
      'id_rsa',
      'config.json'
    ];

    sensitiveFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const stats = fs.statSync(file);
          const mode = (stats.mode & parseInt('777', 8)).toString(8);
          
          if (mode !== '600' && mode !== '644') {
            this.log('warn', `Sensitive file ${file} has permissive permissions: ${mode}`);
          } else {
            this.log('info', `Sensitive file ${file} has appropriate permissions: ${mode}`);
          }
        } catch (error) {
          this.log('warn', `Could not check permissions for ${file}`, error.message);
        }
      }
    });

    // Check .gitignore
    const gitignorePath = '.gitignore';
    if (fs.existsSync(gitignorePath)) {
      try {
        const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
        const requiredIgnores = ['.env', '.env.local', 'node_modules', '*.log'];
        
        requiredIgnores.forEach(ignore => {
          if (gitignoreContent.includes(ignore)) {
            this.log('info', `Gitignore properly excludes: ${ignore}`);
          } else {
            this.log('warn', `Gitignore missing: ${ignore}`);
          }
        });
      } catch (error) {
        this.log('warn', 'Could not read .gitignore', error.message);
      }
    } else {
      this.log('error', '.gitignore file not found');
    }
  }

  // Get list of source files to check
  getSourceFiles() {
    const extensions = ['.ts', '.tsx', '.js', '.jsx', '.astro'];
    const directories = ['src', 'scripts'];
    const files = [];

    const scanDirectory = (dir) => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      });
    };

    directories.forEach(scanDirectory);
    return files;
  }

  // Generate security report
  generateReport() {
    console.log('\n📊 Security Audit Report');
    console.log('========================');
    
    console.log(`\n✅ Passed Checks: ${this.results.passed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Failed Checks: ${this.results.failed.length}`);

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`   - ${warning.message}`);
      });
    }

    if (this.results.failed.length > 0) {
      console.log('\n❌ Failed Checks:');
      this.results.failed.forEach(failure => {
        console.log(`   - ${failure.message}`);
      });
    }

    const totalChecks = this.results.passed.length + this.results.warnings.length + this.results.failed.length;
    const score = Math.round((this.results.passed.length / totalChecks) * 100);
    
    console.log(`\n🎯 Security Score: ${score}%`);
    
    if (score >= 90) {
      console.log('🟢 Excellent security posture');
    } else if (score >= 75) {
      console.log('🟡 Good security posture with room for improvement');
    } else if (score >= 60) {
      console.log('🟠 Moderate security posture - address warnings and failures');
    } else {
      console.log('🔴 Poor security posture - immediate attention required');
    }

    return {
      score,
      passed: this.results.passed.length,
      warnings: this.results.warnings.length,
      failed: this.results.failed.length,
      total: totalChecks
    };
  }

  // Run all security checks
  async runAudit() {
    console.log('🔒 Starting Security Audit for Qatar Airways Stopover AI Agent');
    console.log('================================================================');

    this.checkHardcodedSecrets();
    this.checkEnvironmentVariables();
    this.checkSecurityHeaders();
    this.checkInputValidation();
    this.checkRateLimiting();
    this.checkCorsConfiguration();
    await this.checkDependencyVulnerabilities();
    this.checkFilePermissions();

    return this.generateReport();
  }
}

// Run the audit if this script is executed directly
const auditor = new SecurityAuditor();
auditor.runAudit().then(report => {
  process.exit(report.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('Security audit failed:', error);
  process.exit(1);
});

export default SecurityAuditor;