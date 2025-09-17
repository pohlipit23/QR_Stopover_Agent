import { describe, it, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';

describe('Chat Test Page Functional Validation', () => {
  describe('Page Structure Validation', () => {
    it('should have chat-test.astro page file', () => {
      const chatTestPath = path.join(process.cwd(), 'src/pages/chat-test.astro');
      expect(fs.existsSync(chatTestPath)).toBe(true);
      
      const content = fs.readFileSync(chatTestPath, 'utf-8');
      
      // Verify essential page structure
      expect(content).toContain('Chat Container Test');
      expect(content).toContain('ChatContainer');
      expect(content).toContain('client:load');
      expect(content).toContain('Qatar Airways Stopover');
    });

    it('should include proper styling and layout', () => {
      const chatTestPath = path.join(process.cwd(), 'src/pages/chat-test.astro');
      const content = fs.readFileSync(chatTestPath, 'utf-8');
      
      // Check for Qatar Airways branding colors
      expect(content).toContain('bg-primary-burgundy');
      expect(content).toContain('text-primary-burgundy');
      expect(content).toContain('#662046'); // Qatar Airways burgundy color
      
      // Check for proper layout structure
      expect(content).toContain('Layout');
      expect(content).toContain('min-h-screen');
    });

    it('should pass sample customer and booking data', () => {
      const chatTestPath = path.join(process.cwd(), 'src/pages/chat-test.astro');
      const content = fs.readFileSync(chatTestPath, 'utf-8');
      
      // Verify sample data is imported and used
      expect(content).toContain('sampleCustomer');
      expect(content).toContain('sampleBooking');
      expect(content).toContain('customer={sampleCustomer}');
      expect(content).toContain('booking={sampleBooking}');
    });
  });

  describe('ChatContainer Component Validation', () => {
    it('should have ChatContainer component file', () => {
      const chatContainerPath = path.join(process.cwd(), 'src/components/ChatContainer.tsx');
      expect(fs.existsSync(chatContainerPath)).toBe(true);
      
      const content = fs.readFileSync(chatContainerPath, 'utf-8');
      
      // Verify essential component structure
      expect(content).toContain('ChatContainerProps');
      expect(content).toContain('useChat');
      expect(content).toContain('/api/chat');
      expect(content).toContain('MessageBubble');
      expect(content).toContain('MultiModalInput');
    });

    it('should integrate with AI SDK properly', () => {
      const chatContainerPath = path.join(process.cwd(), 'src/components/ChatContainer.tsx');
      const content = fs.readFileSync(chatContainerPath, 'utf-8');
      
      // Verify AI SDK integration
      expect(content).toContain("import { useChat } from 'ai/react'");
      expect(content).toContain('api: \'/api/chat\'');
      expect(content).toContain('conversationContext');
      expect(content).toContain('onError');
      expect(content).toContain('onFinish');
    });

    it('should handle tool interactions', () => {
      const chatContainerPath = path.join(process.cwd(), 'src/components/ChatContainer.tsx');
      const content = fs.readFileSync(chatContainerPath, 'utf-8');
      
      // Verify tool handling functionality
      expect(content).toContain('handleRichContentAction');
      expect(content).toContain('handleFormSubmit');
      expect(content).toContain('toolInvocations');
      expect(content).toContain('selectCategory');
      expect(content).toContain('selectHotel');
    });
  });

  describe('Chat API Endpoint Validation', () => {
    it('should have chat API endpoint file', () => {
      const chatApiPath = path.join(process.cwd(), 'src/pages/api/chat.ts');
      expect(fs.existsSync(chatApiPath)).toBe(true);
      
      const content = fs.readFileSync(chatApiPath, 'utf-8');
      
      // Verify API structure
      expect(content).toContain('export const POST: APIRoute');
      expect(content).toContain('streamText');
      expect(content).toContain('bookingFunctions');
      expect(content).toContain('generateSystemPrompt');
    });

    it('should use correct AI SDK integration', () => {
      const chatApiPath = path.join(process.cwd(), 'src/pages/api/chat.ts');
      const content = fs.readFileSync(chatApiPath, 'utf-8');
      
      // Verify AI SDK usage
      expect(content).toContain("import { streamText } from 'ai'");
      expect(content).toContain('tools: bookingFunctions');
      expect(content).toContain('system: generateSystemPrompt');
      expect(content).toContain('toTextStreamResponse');
    });

    it('should handle errors properly', () => {
      const chatApiPath = path.join(process.cwd(), 'src/pages/api/chat.ts');
      const content = fs.readFileSync(chatApiPath, 'utf-8');
      
      // Verify error handling
      expect(content).toContain('try {');
      expect(content).toContain('catch (error');
      expect(content).toContain('errorReporter.report');
      expect(content).toContain('status: 500');
      expect(content).toContain('retryable');
    });
  });

  describe('Booking Functions Tool Structure Validation', () => {
    it('should have properly structured booking functions', () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      const expectedTools = [
        'showStopoverCategories',
        'selectStopoverCategory',
        'selectHotel',
        'selectTimingAndDuration',
        'selectExtras',
        'initiatePayment',
        'completeBooking'
      ];

      expectedTools.forEach(toolName => {
        const tool = bookingFunctions[toolName];
        
        expect(tool).toBeDefined();
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('parameters');
        expect(tool).toHaveProperty('execute');
        
        expect(typeof tool.description).toBe('string');
        expect(typeof tool.execute).toBe('function');
        
        // Verify parameters is a Zod schema (has _def property)
        expect(tool.parameters).toBeDefined();
        expect(tool.parameters._def).toBeDefined();
        
        // Verify no inputSchema property (old format)
        expect(tool.inputSchema).toBeUndefined();
      });
    });

    it('should execute tools without errors', async () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Test showStopoverCategories
      const categoriesResult = await bookingFunctions.showStopoverCategories.execute({});
      expect(categoriesResult.success).toBe(true);
      expect(categoriesResult.categories).toBeDefined();
      expect(categoriesResult.uiComponent).toBeDefined();
      expect(categoriesResult.uiComponent.type).toBe('stopover-categories');
      
      // Test selectStopoverCategory
      const categoryResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(categoryResult.success).toBe(true);
      expect(categoryResult.selectedCategory).toBe('premium');
      expect(categoryResult.hotels).toBeDefined();
      expect(categoryResult.uiComponent.type).toBe('hotels');
      
      // Test selectHotel
      const hotelResult = await bookingFunctions.selectHotel.execute({
        hotelId: 'hotel-1',
        hotelName: 'Test Hotel'
      });
      expect(hotelResult.success).toBe(true);
      expect(hotelResult.selectedHotel).toBe('hotel-1');
      expect(hotelResult.uiComponent.type).toBe('stopover-options');
      
      // Test selectTimingAndDuration
      const timingResult = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });
      expect(timingResult.success).toBe(true);
      expect(timingResult.selectedTiming).toBe('outbound');
      expect(timingResult.selectedDuration).toBe(2);
      expect(timingResult.uiComponent.type).toBe('stopover-extras');
    });

    it('should validate Zod schemas properly', () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Test parameter validation for selectStopoverCategory
      const categoryTool = bookingFunctions.selectStopoverCategory;
      const categorySchema = categoryTool.parameters;
      
      // Valid parameters should pass
      const validParams = { categoryId: 'premium', categoryName: 'Premium' };
      const validResult = categorySchema.safeParse(validParams);
      expect(validResult.success).toBe(true);
      
      // Invalid parameters should fail
      const invalidParams = { categoryId: 'premium' }; // missing categoryName
      const invalidResult = categorySchema.safeParse(invalidParams);
      expect(invalidResult.success).toBe(false);
      
      // Test parameter validation for selectTimingAndDuration
      const timingTool = bookingFunctions.selectTimingAndDuration;
      const timingSchema = timingTool.parameters;
      
      // Valid timing parameters
      const validTiming = { timing: 'outbound', duration: 2 };
      const validTimingResult = timingSchema.safeParse(validTiming);
      expect(validTimingResult.success).toBe(true);
      
      // Invalid timing (wrong enum value)
      const invalidTiming = { timing: 'invalid', duration: 2 };
      const invalidTimingResult = timingSchema.safeParse(invalidTiming);
      expect(invalidTimingResult.success).toBe(false);
    });
  });

  describe('Data Dependencies Validation', () => {
    it('should have required data files', () => {
      const requiredDataFiles = [
        'src/data/customerData.ts',
        'src/data/stopoverCategories.ts',
        'src/data/hotelData.ts',
        'src/data/tourData.ts',
        'src/data/transferData.ts'
      ];

      requiredDataFiles.forEach(filePath => {
        const fullPath = path.join(process.cwd(), filePath);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    it('should have sample data for testing', () => {
      const { sampleCustomer, sampleBooking } = require('../data/customerData');
      
      expect(sampleCustomer).toBeDefined();
      expect(sampleCustomer.name).toBeDefined();
      expect(sampleCustomer.email).toBeDefined();
      
      expect(sampleBooking).toBeDefined();
      expect(sampleBooking.pnr).toBeDefined();
      expect(sampleBooking.route).toBeDefined();
      expect(sampleBooking.route.origin).toBeDefined();
      expect(sampleBooking.route.destination).toBeDefined();
    });

    it('should have stopover categories data', () => {
      const { stopoverCategories } = require('../data/stopoverCategories');
      
      expect(stopoverCategories).toBeDefined();
      expect(Array.isArray(stopoverCategories)).toBe(true);
      expect(stopoverCategories.length).toBeGreaterThan(0);
      
      // Verify category structure
      const firstCategory = stopoverCategories[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
      expect(firstCategory).toHaveProperty('category');
      expect(firstCategory).toHaveProperty('starRating');
      expect(firstCategory).toHaveProperty('pricePerNight');
      expect(firstCategory).toHaveProperty('amenities');
    });
  });

  describe('Component Dependencies Validation', () => {
    it('should have MessageBubble component', () => {
      const messageBubblePath = path.join(process.cwd(), 'src/components/MessageBubble.tsx');
      expect(fs.existsSync(messageBubblePath)).toBe(true);
    });

    it('should have MultiModalInput component', () => {
      const multiModalInputPath = path.join(process.cwd(), 'src/components/MultiModalInput.tsx');
      expect(fs.existsSync(multiModalInputPath)).toBe(true);
    });

    it('should have Layout component', () => {
      const layoutPath = path.join(process.cwd(), 'src/components/Layout.astro');
      expect(fs.existsSync(layoutPath)).toBe(true);
    });

    it('should have required type definitions', () => {
      const typesPath = path.join(process.cwd(), 'src/types');
      expect(fs.existsSync(typesPath)).toBe(true);
      
      // Check for index.ts or individual type files
      const indexPath = path.join(typesPath, 'index.ts');
      const hasIndexFile = fs.existsSync(indexPath);
      
      if (hasIndexFile) {
        const content = fs.readFileSync(indexPath, 'utf-8');
        expect(content).toContain('ConversationState');
        expect(content).toContain('Message');
        expect(content).toContain('CustomerData');
        expect(content).toContain('BookingData');
      }
    });
  });

  describe('End-to-End Functionality Validation', () => {
    it('should support complete booking flow', async () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Simulate complete booking flow
      const step1 = await bookingFunctions.showStopoverCategories.execute({});
      expect(step1.success).toBe(true);
      
      const step2 = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(step2.success).toBe(true);
      
      const step3 = await bookingFunctions.selectHotel.execute({
        hotelId: 'hotel-1',
        hotelName: 'Premium Hotel'
      });
      expect(step3.success).toBe(true);
      
      const step4 = await bookingFunctions.selectTimingAndDuration.execute({
        timing: 'outbound',
        duration: 2
      });
      expect(step4.success).toBe(true);
      
      const step5 = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [],
        totalExtrasPrice: 60
      });
      expect(step5.success).toBe(true);
      
      const step6 = await bookingFunctions.initiatePayment.execute({
        paymentMethod: 'credit-card',
        totalAmount: 425
      });
      expect(step6.success).toBe(true);
      
      const step7 = await bookingFunctions.completeBooking.execute({
        paymentData: {
          method: 'credit-card',
          confirmed: true
        }
      });
      expect(step7.success).toBe(true);
      expect(step7.newPNR).toBeDefined();
    });

    it('should handle UI component generation', async () => {
      const { bookingFunctions } = require('../lib/booking-functions');
      
      // Test UI component generation for each step
      const categoriesResult = await bookingFunctions.showStopoverCategories.execute({});
      expect(categoriesResult.uiComponent).toBeDefined();
      expect(categoriesResult.uiComponent.type).toBe('stopover-categories');
      expect(categoriesResult.uiComponent.data).toBeDefined();
      
      const hotelResult = await bookingFunctions.selectStopoverCategory.execute({
        categoryId: 'premium',
        categoryName: 'Premium'
      });
      expect(hotelResult.uiComponent).toBeDefined();
      expect(hotelResult.uiComponent.type).toBe('hotels');
      expect(hotelResult.uiComponent.data.hotels).toBeDefined();
      
      const summaryResult = await bookingFunctions.selectExtras.execute({
        includeTransfers: true,
        selectedTours: [],
        totalExtrasPrice: 60
      });
      expect(summaryResult.uiComponent).toBeDefined();
      expect(summaryResult.uiComponent.type).toBe('summary');
      expect(summaryResult.uiComponent.data.total).toBeDefined();
    });
  });
});