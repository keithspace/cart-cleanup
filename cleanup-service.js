const admin = require('firebase-admin');
const { initializeFirebase } = require('./firebase-service');

const db = initializeFirebase();

async function returnProductQuantities(products) {
  const batch = db.batch();
  const productRefs = [];

  for (const product of products) {
    if (!product.id) continue;
    
    const productRef = db.collection('products').doc(product.id);
    productRefs.push(productRef);
    
    batch.update(productRef, {
      stock: admin.firestore.FieldValue.increment(product.quantity),
      lastRestocked: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  try {
    await batch.commit();
    console.log(`Successfully returned quantities for ${productRefs.length} products`);
  } catch (error) {
    console.error('Error returning product quantities:', error);
    throw error;
  }
}

async function clearCustomerCart(customerId) {
  const cartRef = db.collection('customers').doc(customerId).collection('cart').doc('activeCart');
  
  try {
    await cartRef.update({
      products: [],
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      lastAddedTimestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`Cleared cart for customer ${customerId}`);
  } catch (error) {
    console.error(`Error clearing cart for customer ${customerId}:`, error);
    throw error;
  }
}

async function processCustomerCarts() {
  try {
    const customersSnapshot = await db.collection('customers').get();
    let processedCount = 0;

    for (const customerDoc of customersSnapshot.docs) {
      const cartRef = customerDoc.ref.collection('cart').doc('activeCart');
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        const cartData = cartDoc.data();
        if (cartData.products && cartData.products.length > 0) {
          await returnProductQuantities(cartData.products);
          await clearCustomerCart(customerDoc.id);
          processedCount++;
        }
      }
    }

    console.log(`Processed ${processedCount} customer carts`);
    return { success: true, processedCount };
  } catch (error) {
    console.error('Error processing customer carts:', error);
    throw error;
  }
}

module.exports = { processCustomerCarts };
