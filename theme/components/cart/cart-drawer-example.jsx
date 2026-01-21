// /**
//  * CartDrawer Example Usage
//  * 
//  * This file demonstrates how to use the CartDrawer component
//  * with real cart data from the useCart hook.
//  */

// import React, { useState } from "react";
// import CartDrawer from "./cart-drawer";

// const CartDrawerExample = () => {
//   const [isCartOpen, setIsCartOpen] = useState(false);

//   const handleOpenCart = () => {
//     setIsCartOpen(true);
//   };

//   const handleCloseCart = () => {
//     setIsCartOpen(false);
//   };

//   return (
//     <div className="p-8">
//       <h1 className="text-2xl font-bold mb-6">Cart Drawer Example</h1>
      
//       <div className="space-y-4">
//         <button
//           onClick={handleOpenCart}
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
//         >
//           Open Cart
//         </button>
//       </div>

//       {/* Cart Drawer */}
//       <CartDrawer
//         isOpen={isCartOpen}
//         onClose={handleCloseCart}
//       />
//     </div>
//   );
// };

// export default CartDrawerExample;
