import assert from 'node:assert';

/**
 * Unit Test Suite for Role-Based Access Control & Auth Utilities
 */
console.log('🧪 Running Unit Tests: Auth & RBAC Permissions...');

const ROLES = ['BUYER', 'MAKER', 'INSPECTOR', 'ADMIN', 'CEO'] as const;
type Role = typeof ROLES[number];

function hasPermission(role: Role, requiredRole: Role | Role[]): boolean {
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(role);
  }
  return role === requiredRole;
}

// Test 1: Buyer access constraints
assert.strictEqual(hasPermission('BUYER', ['BUYER', 'ADMIN']), true, 'Buyer should match allowed buyer role');
assert.strictEqual(hasPermission('BUYER', 'ADMIN'), false, 'Buyer cannot access admin route');

// Test 2: Maker access constraints
assert.strictEqual(hasPermission('MAKER', ['MAKER', 'ADMIN']), true, 'Maker should access maker portal');
assert.strictEqual(hasPermission('MAKER', 'INSPECTOR'), false, 'Maker cannot access inspector portal');

// Test 3: CEO access constraints
assert.strictEqual(hasPermission('CEO', ['CEO', 'ADMIN']), true, 'CEO can access executive dashboard');

console.log('✅ Auth & RBAC Unit Tests Passed!');
