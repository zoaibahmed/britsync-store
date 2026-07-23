import assert from 'node:assert';
import { calculateSellingPrice } from '../../src/lib/pricing';

/**
 * Unit Test Suite for Britsync Pricing Engine
 */
console.log('🧪 Running Unit Tests: Pricing Engine...');

// Test 1: Standard product markup calculation
const basePrice = 100;
const sellingPrice = calculateSellingPrice(basePrice, 'Textiles', undefined, 'VERIFIED');
assert.strictEqual(typeof sellingPrice, 'number', 'Selling price should be a number');
assert.ok(sellingPrice > basePrice, 'Selling price must include platform markup');

// Test 2: Elite Verification tier markup check
const elitePrice = calculateSellingPrice(basePrice, 'Textiles', undefined, 'ELITE');
assert.ok(elitePrice >= basePrice, 'Elite price calculation valid');

// Test 3: GI Protected Appellation tier check
const giPrice = calculateSellingPrice(basePrice, 'Textiles', undefined, 'GI');
assert.ok(giPrice >= basePrice, 'GI Protected Appellation price calculation valid');

console.log('✅ Pricing Engine Unit Tests Passed!');
