// Paste this in browser console to test cart manually
// This will force call the addItem function

// Get the cart store
const cartStore = window.useCartStore?.getState?.() || 
  (window as any).zustand?.stores?.cart?.getState?.();

if (cartStore && cartStore.addItem) {
  // Create a fake product for testing
  const testProduct = {
    id: 999,
    name: "Test Product for Debugging",
    price: 100,
    price_unit: "mp"
  };
  
  console.log('🧪 Manual cart test starting...');
  
  // Call addItem directly
  cartStore.addItem(testProduct, 1)
    .then(() => {
      console.log('✅ Manual cart test completed');
    })
    .catch((error) => {
      console.error('❌ Manual cart test failed:', error);
    });
} else {
  console.error('❌ Cart store not accessible from console');
  console.log('Available on window:', Object.keys(window).filter(k => k.includes('cart') || k.includes('store')));
}