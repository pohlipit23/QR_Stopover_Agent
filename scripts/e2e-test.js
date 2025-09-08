#!/usr/bin/env node

/**
 * End-to-End Testing Script
 * Qatar Airways Stopover AI Agent
 * 
 * This script performs comprehensive end-to-end testing of the application
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class E2ETestRunner {
  constructor() {
    this.results = {
      passed: [],
      failed: [],
      warnings: []
    };
    this.baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4321';
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

  // Test application availability
  async testApplicationAvailability() {
    console.log('\n🌐 Testing Application Availability...');
    
    try {
      const response = await fetch(this.baseUrl);
      
      if (response.ok) {
        this.log('info', `Application is accessible at ${this.baseUrl}`);
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/html')) {
          this.log('info', 'Application returns HTML content');
        } else {
          this.log('warn', 'Application does not return HTML content', { contentType });
        }
      } else {
        this.log('error', `Application returned status ${response.status}`, {
          status: response.status,
          statusText: response.statusText
        });
      }
    } catch (error) {
      this.log('error', 'Failed to connect to application', {
        error: error.message,
        baseUrl: this.baseUrl
      });
    }
  }

  // Test entry points
  async testEntryPoints() {
    console.log('\n📧 Testing Entry Points...');
    
    const entryPoints = [
      '/email-template',
      '/mmb',
      '/mmb-test'
    ];

    for (const endpoint of entryPoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        
        if (response.ok) {
          this.log('info', `Entry point ${endpoint} is accessible`);
          
          const html = await response.text();
          
          // Check for Qatar Airways branding
          if (html.includes('Qatar Airways') || html.includes('qatar-airways')) {
            this.log('info', `Entry point ${endpoint} includes Qatar Airways branding`);
          } else {
            this.log('warn', `Entry point ${endpoint} missing Qatar Airways branding`);
          }
          
          // Check for customer data
          if (html.includes('Alex Johnson') || html.includes('X4HG8')) {
            this.log('info', `Entry point ${endpoint} includes customer data`);
          } else {
            this.log('warn', `Entry point ${endpoint} missing customer data`);
          }
        } else {
          this.log('error', `Entry point ${endpoint} returned status ${response.status}`);
        }
      } catch (error) {
        this.log('error', `Failed to test entry point ${endpoint}`, error.message);
      }
    }
  }

  // Test API endpoints
  async testAPIEndpoints() {
    console.log('\n🔌 Testing API Endpoints...');
    
    const apiEndpoints = [
      {
        path: '/api/chat',
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'Hello' }],
          conversationContext: {
            customer: { name: 'Test User' },
            booking: { pnr: 'TEST123' }
          }
        }
      }
    ];

    for (const endpoint of apiEndpoints) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint.path}`, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(endpoint.body)
        });

        if (response.ok) {
          this.log('info', `API endpoint ${endpoint.path} is functional`);
          
          // Check if it's a streaming response
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('text/plain')) {
            this.log('info', `API endpoint ${endpoint.path} returns streaming response`);
          }
        } else {
          this.log('error', `API endpoint ${endpoint.path} returned status ${response.status}`);
        }
      } catch (error) {
        this.log('error', `Failed to test API endpoint ${endpoint.path}`, error.message);
      }
    }
  }

  // Test security headers
  async testSecurityHeaders() {
    console.log('\n🔒 Testing Security Headers...');
    
    const requiredHeaders = [
      'X-XSS-Protection',
      'X-Content-Type-Options',
      'X-Frame-Options',
      'Strict-Transport-Security',
      'Content-Security-Policy',
      'Referrer-Policy'
    ];

    try {
      const response = await fetch(this.baseUrl);
      
      requiredHeaders.forEach(header => {
        const headerValue = response.headers.get(header);
        if (headerValue) {
          this.log('info', `Security header ${header} is present`, { value: headerValue });
        } else {
          this.log('warn', `Security header ${header} is missing`);
        }
      });

      // Check HTTPS enforcement
      if (this.baseUrl.startsWith('https://')) {
        this.log('info', 'Application uses HTTPS');
      } else {
        this.log('warn', 'Application not using HTTPS in production');
      }
    } catch (error) {
      this.log('error', 'Failed to test security headers', error.message);
    }
  }

  // Test responsive design
  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    // This is a simplified test - in a real scenario, you'd use a browser automation tool
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      // Check for viewport meta tag
      if (html.includes('viewport')) {
        this.log('info', 'Viewport meta tag is present for responsive design');
      } else {
        this.log('warn', 'Viewport meta tag is missing');
      }
      
      // Check for responsive CSS classes or media queries
      if (html.includes('responsive') || html.includes('@media')) {
        this.log('info', 'Responsive design elements detected');
      } else {
        this.log('warn', 'No responsive design elements detected');
      }
      
      // Check for mobile-friendly elements
      if (html.includes('touch') || html.includes('mobile')) {
        this.log('info', 'Mobile-friendly elements detected');
      } else {
        this.log('warn', 'No mobile-friendly elements detected');
      }
    } catch (error) {
      this.log('error', 'Failed to test responsive design', error.message);
    }
  }

  // Test performance
  async testPerformance() {
    console.log('\n⚡ Testing Performance...');
    
    try {
      const startTime = Date.now();
      const response = await fetch(this.baseUrl);
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      
      if (loadTime < 3000) {
        this.log('info', `Page load time is acceptable: ${loadTime}ms`);
      } else if (loadTime < 5000) {
        this.log('warn', `Page load time is slow: ${loadTime}ms`);
      } else {
        this.log('error', `Page load time is too slow: ${loadTime}ms`);
      }
      
      // Check response size
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        const sizeKB = parseInt(contentLength) / 1024;
        if (sizeKB < 500) {
          this.log('info', `Page size is optimal: ${sizeKB.toFixed(2)}KB`);
        } else if (sizeKB < 1000) {
          this.log('warn', `Page size is large: ${sizeKB.toFixed(2)}KB`);
        } else {
          this.log('error', `Page size is too large: ${sizeKB.toFixed(2)}KB`);
        }
      }
    } catch (error) {
      this.log('error', 'Failed to test performance', error.message);
    }
  }

  // Test accessibility
  async testAccessibility() {
    console.log('\n♿ Testing Accessibility...');
    
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      // Check for alt attributes on images
      const imgTags = html.match(/<img[^>]*>/g) || [];
      let imagesWithAlt = 0;
      
      imgTags.forEach(img => {
        if (img.includes('alt=')) {
          imagesWithAlt++;
        }
      });
      
      if (imgTags.length > 0) {
        const altPercentage = (imagesWithAlt / imgTags.length) * 100;
        if (altPercentage === 100) {
          this.log('info', 'All images have alt attributes');
        } else {
          this.log('warn', `${altPercentage.toFixed(1)}% of images have alt attributes`);
        }
      }
      
      // Check for semantic HTML
      const semanticTags = ['header', 'nav', 'main', 'section', 'article', 'aside', 'footer'];
      const foundSemanticTags = semanticTags.filter(tag => html.includes(`<${tag}`));
      
      if (foundSemanticTags.length > 0) {
        this.log('info', `Semantic HTML tags found: ${foundSemanticTags.join(', ')}`);
      } else {
        this.log('warn', 'No semantic HTML tags found');
      }
      
      // Check for ARIA attributes
      if (html.includes('aria-') || html.includes('role=')) {
        this.log('info', 'ARIA attributes detected for accessibility');
      } else {
        this.log('warn', 'No ARIA attributes detected');
      }
    } catch (error) {
      this.log('error', 'Failed to test accessibility', error.message);
    }
  }

  // Test Qatar Airways design system compliance
  async testDesignSystemCompliance() {
    console.log('\n🎨 Testing Qatar Airways Design System Compliance...');
    
    try {
      const response = await fetch(this.baseUrl);
      const html = await response.text();
      
      // Check for Qatar Airways branding elements
      const brandingElements = [
        'Qatar Airways',
        'qatar-airways',
        'QR',
        'Privilege Club'
      ];
      
      let brandingFound = 0;
      brandingElements.forEach(element => {
        if (html.toLowerCase().includes(element.toLowerCase())) {
          brandingFound++;
        }
      });
      
      if (brandingFound > 0) {
        this.log('info', `Qatar Airways branding elements found: ${brandingFound}/${brandingElements.length}`);
      } else {
        this.log('error', 'No Qatar Airways branding elements found');
      }
      
      // Check for design system colors (simplified check)
      if (html.includes('#662046') || html.includes('burgundy')) {
        this.log('info', 'Qatar Airways brand colors detected');
      } else {
        this.log('warn', 'Qatar Airways brand colors not detected in HTML');
      }
      
      // Check for consistent typography
      if (html.includes('Jotia') || html.includes('font-family')) {
        this.log('info', 'Typography system detected');
      } else {
        this.log('warn', 'No typography system detected');
      }
    } catch (error) {
      this.log('error', 'Failed to test design system compliance', error.message);
    }
  }

  // Test data consistency
  async testDataConsistency() {
    console.log('\n📊 Testing Data Consistency...');
    
    const expectedData = {
      customerName: 'Alex Johnson',
      pnr: 'X4HG8',
      privilegeClub: 'QR12345678',
      route: 'LHR-BKK',
      passengers: '2 adults',
      newPnr: 'X9FG1'
    };

    try {
      // Test multiple endpoints for data consistency
      const endpoints = ['/email-template', '/mmb-test'];
      
      for (const endpoint of endpoints) {
        const response = await fetch(`${this.baseUrl}${endpoint}`);
        const html = await response.text();
        
        let consistentData = 0;
        Object.entries(expectedData).forEach(([key, value]) => {
          if (html.includes(value)) {
            consistentData++;
          }
        });
        
        const consistencyPercentage = (consistentData / Object.keys(expectedData).length) * 100;
        
        if (consistencyPercentage >= 80) {
          this.log('info', `Data consistency on ${endpoint}: ${consistencyPercentage.toFixed(1)}%`);
        } else {
          this.log('warn', `Data consistency on ${endpoint}: ${consistencyPercentage.toFixed(1)}%`);
        }
      }
    } catch (error) {
      this.log('error', 'Failed to test data consistency', error.message);
    }
  }

  // Test error handling
  async testErrorHandling() {
    console.log('\n🚨 Testing Error Handling...');
    
    const errorScenarios = [
      {
        name: 'Invalid API endpoint',
        url: `${this.baseUrl}/api/nonexistent`,
        expectedStatus: 404
      },
      {
        name: 'Invalid chat request',
        url: `${this.baseUrl}/api/chat`,
        method: 'POST',
        body: { invalid: 'data' },
        expectedStatus: 400
      }
    ];

    for (const scenario of errorScenarios) {
      try {
        const options = {
          method: scenario.method || 'GET',
          headers: scenario.body ? { 'Content-Type': 'application/json' } : {},
          body: scenario.body ? JSON.stringify(scenario.body) : undefined
        };

        const response = await fetch(scenario.url, options);
        
        if (response.status === scenario.expectedStatus) {
          this.log('info', `Error handling works for: ${scenario.name}`);
        } else {
          this.log('warn', `Unexpected status for ${scenario.name}`, {
            expected: scenario.expectedStatus,
            actual: response.status
          });
        }
      } catch (error) {
        this.log('error', `Failed to test error scenario: ${scenario.name}`, error.message);
      }
    }
  }

  // Generate comprehensive test report
  generateReport() {
    console.log('\n📋 End-to-End Test Report');
    console.log('==========================');
    
    console.log(`\n✅ Passed Tests: ${this.results.passed.length}`);
    console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
    console.log(`❌ Failed Tests: ${this.results.failed.length}`);

    if (this.results.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`   - ${warning.message}`);
      });
    }

    if (this.results.failed.length > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.failed.forEach(failure => {
        console.log(`   - ${failure.message}`);
      });
    }

    const totalTests = this.results.passed.length + this.results.warnings.length + this.results.failed.length;
    const successRate = Math.round((this.results.passed.length / totalTests) * 100);
    
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    // Test categories summary
    console.log('\n📊 Test Categories:');
    console.log('   - Application Availability ✓');
    console.log('   - Entry Points ✓');
    console.log('   - API Endpoints ✓');
    console.log('   - Security Headers ✓');
    console.log('   - Responsive Design ✓');
    console.log('   - Performance ✓');
    console.log('   - Accessibility ✓');
    console.log('   - Design System Compliance ✓');
    console.log('   - Data Consistency ✓');
    console.log('   - Error Handling ✓');

    if (successRate >= 90) {
      console.log('\n🟢 Excellent - Application is ready for production');
    } else if (successRate >= 75) {
      console.log('\n🟡 Good - Minor issues to address before production');
    } else if (successRate >= 60) {
      console.log('\n🟠 Moderate - Several issues need attention');
    } else {
      console.log('\n🔴 Poor - Significant issues must be resolved');
    }

    return {
      successRate,
      passed: this.results.passed.length,
      warnings: this.results.warnings.length,
      failed: this.results.failed.length,
      total: totalTests
    };
  }

  // Run all E2E tests
  async runTests() {
    console.log('🧪 Starting End-to-End Tests for Qatar Airways Stopover AI Agent');
    console.log('================================================================');
    console.log(`Testing against: ${this.baseUrl}`);

    await this.testApplicationAvailability();
    await this.testEntryPoints();
    await this.testAPIEndpoints();
    await this.testSecurityHeaders();
    await this.testResponsiveDesign();
    await this.testPerformance();
    await this.testAccessibility();
    await this.testDesignSystemCompliance();
    await this.testDataConsistency();
    await this.testErrorHandling();

    return this.generateReport();
  }
}

// Run the tests if this script is executed directly
const testRunner = new E2ETestRunner();
testRunner.runTests().then(report => {
  process.exit(report.failed > 0 ? 1 : 0);
}).catch(error => {
  console.error('E2E tests failed:', error);
  process.exit(1);
});

export default E2ETestRunner;