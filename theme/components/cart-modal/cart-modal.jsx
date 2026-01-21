// import React, { useState } from "react";
// import { FDKLink } from "fdk-core/components";

// const CartModal = ({ isOpen, onClose }) => {
//     const [selectedSizes, setSelectedSizes] = useState({
//         item1: "L",
//         item2: "L"
//     });
//     const [quantities, setQuantities] = useState({
//         item1: 1,
//         item2: 1
//     });
//     const [selectedColors, setSelectedColors] = useState({
//         item1: { name: "Black", hex: "#000000" },
//         item2: { name: "Black", hex: "#000000" }
//     });

//     // Static cart data to prevent empty state
//     const cartData = {
//         items: [
//             {
//                 id: "item1",
//                 product: {
//                     name: "Textured Knit Top",
//                     brand: "BRAND/DESIGNER NAME",
//                     price: 888,
//                     originalPrice: 888,
//                     image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center&auto=format&q=80",
//                     sizes: ["S", "M", "L", "XL"],
//                     colors: [
//                         { name: "Black", hex: "#000000" },
//                         { name: "Brown", hex: "#5C3A2F" },
//                         { name: "Taupe", hex: "#A9A39B" },
//                         { name: "Cream", hex: "#F5F5DC" }
//                     ],
//                     stock: "1 LEFT",
//                     deliveryTime: "DELIVERY TIME"
//                 }
//             },
//             {
//                 id: "item2",
//                 product: {
//                     name: "Textured Knit Top",
//                     brand: "BRAND/DESIGNER NAME",
//                     price: 888,
//                     originalPrice: 888,
//                     image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center&auto=format&q=80",
//                     sizes: ["S", "M", "L", "XL"],
//                     colors: [
//                         { name: "Black", hex: "#000000" },
//                         { name: "Brown", hex: "#5C3A2F" },
//                         { name: "Taupe", hex: "#A9A39B" },
//                         { name: "Cream", hex: "#F5F5DC" }
//                     ],
//                     stock: "1 LEFT",
//                     deliveryTime: "DELIVERY TIME"
//                 }
//             }
//         ],
//         recommendedItems: [
//             {
//                 id: "rec1",
//                 product: {
//                     name: "Draped White Garment",
//                     brand: "BRAND/DESIGNER",
//                     price: 888,
//                     originalPrice: 888,
//                     image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center&auto=format&q=80",
//                     colors: [
//                         { name: "Black", hex: "#000000" },
//                         { name: "Brown", hex: "#5C3A2F" },
//                         { name: "Taupe", hex: "#A9A39B" },
//                         { name: "Cream", hex: "#F5F5DC" }
//                     ],
//                     sizes: ["S", "M", "L", "XL"]
//                 }
//             },
//             {
//                 id: "rec2",
//                 product: {
//                     name: "Asymmetrical Black Jacket",
//                     brand: "BRAND/DESIGNER",
//                     price: 888,
//                     originalPrice: 888,
//                     image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center&auto=format&q=80",
//                     colors: [
//                         { name: "Black", hex: "#000000" },
//                         { name: "Brown", hex: "#5C3A2F" },
//                         { name: "Taupe", hex: "#A9A39B" },
//                         { name: "Cream", hex: "#F5F5DC" }
//                     ]
//                 }
//             },
//             {
//                 id: "rec3",
//                 product: {
//                     name: "Asymmetrical Black Jacket",
//                     brand: "BRAND/DESIGNER",
//                     price: 888,
//                     originalPrice: 888,
//                     image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop&crop=center&auto=format&q=80",
//                     colors: [
//                         { name: "Black", hex: "#000000" },
//                         { name: "Brown", hex: "#5C3A2F" },
//                         { name: "Taupe", hex: "#A9A39B" },
//                         { name: "Cream", hex: "#F5F5DC" }
//                     ]
//                 }
//             }
//         ]
//     };

//     const handleSizeSelect = (itemId, size) => {
//         setSelectedSizes(prev => ({ ...prev, [itemId]: size }));
//     };

//     const handleQuantityChange = (itemId, change) => {
//         setQuantities(prev => ({
//             ...prev,
//             [itemId]: Math.max(1, (prev[itemId] || 1) + change)
//         }));
//     };

//     const handleColorSelect = (itemId, color) => {
//         setSelectedColors(prev => ({ ...prev, [itemId]: color }));
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 overflow-hidden">
//             {/* Backdrop */}
//             <div
//                 className="absolute inset-0 bg-black bg-opacity-50"
//                 onClick={onClose}
//             />

//             {/* Mobile Modal */}
//             <div className="md:hidden absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
//                 <div className="flex flex-col h-full">
//                     {/* Header */}
//                     <div className="flex items-center justify-between p-4 border-b border-gray-200">
//                         <div className="flex items-center space-x-4">
//                             <span className="text-sm text-gray-500 font-medium">CART 02</span>
//                             <div className="flex space-x-4 text-sm">
//                                 <button className="text-black hover:underline font-medium">Clear all</button>
//                                 <button className="text-black hover:underline font-medium">Wishlist</button>
//                             </div>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="text-black text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
//                         >
//                             ×
//                         </button>
//                     </div>

//                     {/* Cart Items */}
//                     <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                         {cartData.items.map((item) => (
//                             <div key={item.id} className="flex space-x-4">
//                                 {/* Product Image */}
//                                 <div className="flex-shrink-0 w-20 h-24">
//                                     <img
//                                         src={item.product.image}
//                                         alt={item.product.name}
//                                         className="w-full h-full object-cover rounded"
//                                     />
//                                 </div>

//                                 {/* Product Details */}
//                                 <div className="flex-1 space-y-3">
//                                     <div className="text-sm font-semibold text-gray-900">
//                                         {item.product.brand}
//                                     </div>
//                                     <div className="text-sm text-gray-600">
//                                         {item.product.name}
//                                     </div>
//                                     <div className="text-sm font-semibold text-gray-900">
//                                         ${item.product.price}
//                                     </div>

//                                     {/* Size Selection */}
//                                     <div className="flex space-x-2">
//                                         {item.product.sizes.map((size) => (
//                                             <button
//                                                 key={size}
//                                                 onClick={() => handleSizeSelect(item.id, size)}
//                                                 className={`px-3 py-1 text-xs border rounded transition-colors ${selectedSizes[item.id] === size
//                                                     ? 'border-black bg-black text-white'
//                                                     : 'border-gray-300 text-gray-700 hover:border-gray-400'
//                                                     }`}
//                                             >
//                                                 {size}
//                                             </button>
//                                         ))}
//                                     </div>

//                                     {/* Quantity Control */}
//                                     <div className="flex items-center space-x-2">
//                                         <button
//                                             onClick={() => handleQuantityChange(item.id, -1)}
//                                             className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
//                                         >
//                                             -
//                                         </button>
//                                         <span className="text-sm font-medium min-w-[20px] text-center">
//                                             {String(quantities[item.id] || 1).padStart(2, '0')}
//                                         </span>
//                                         <button
//                                             onClick={() => handleQuantityChange(item.id, 1)}
//                                             className="w-6 h-6 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
//                                         >
//                                             +
//                                         </button>
//                                     </div>

//                                     {/* Color Selection */}
//                                     <div className="flex space-x-2">
//                                         {item.product.colors.map((color, index) => (
//                                             <button
//                                                 key={index}
//                                                 onClick={() => handleColorSelect(item.id, color)}
//                                                 className={`w-4 h-4 rounded-full border-2 transition-all ${selectedColors[item.id]?.hex === color.hex
//                                                     ? 'border-black ring-2 ring-gray-200'
//                                                     : 'border-gray-300 hover:border-gray-400'
//                                                     }`}
//                                                 style={{ backgroundColor: color.hex }}
//                                             />
//                                         ))}
//                                     </div>

//                                     {/* Stock and Actions */}
//                                     <div className="text-xs text-amber-600 font-medium">{item.product.stock}</div>
//                                     <div className="text-xs text-gray-500">{item.product.deliveryTime}</div>

//                                     <div className="flex space-x-4 text-sm">
//                                         <button className="text-gray-600 hover:underline">Move to Wishlist</button>
//                                         <button className="text-gray-600 hover:underline">Delete</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* You May Also Like Section */}
//                         <div className="mt-8">
//                             <h3 className="text-sm font-semibold text-gray-900 mb-4">YOU MAY ALSO LIKE</h3>
//                             <div className="flex space-x-4 overflow-x-auto pb-2">
//                                 {cartData.recommendedItems.map((item) => (
//                                     <div key={item.id} className="flex-shrink-0 w-32">
//                                         <div className="relative group">
//                                             <img
//                                                 src={item.product.image}
//                                                 alt={item.product.name}
//                                                 className="w-full h-32 object-cover rounded"
//                                             />
//                                             {/* Color dots on the right */}
//                                             <div className="absolute right-1 top-2 space-y-1">
//                                                 {item.product.colors.map((color, index) => (
//                                                     <div
//                                                         key={index}
//                                                         className="w-2 h-2 rounded-full border border-white shadow-sm"
//                                                         style={{ backgroundColor: color.hex }}
//                                                     />
//                                                 ))}
//                                             </div>
//                                         </div>
//                                         <button className="w-full mt-2 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
//                                             ADD TO CART
//                                         </button>
//                                         <div className="text-xs font-semibold text-gray-900 mt-1">
//                                             {item.product.brand}
//                                         </div>
//                                         <div className="text-xs text-gray-600">
//                                             {item.product.name}
//                                         </div>
//                                         <div className="text-xs text-gray-900">
//                                             ${item.product.price} ${item.product.originalPrice}
//                                         </div>
//                                         {item.product.sizes && (
//                                             <div className="flex space-x-1 mt-1">
//                                                 {item.product.sizes.map((size) => (
//                                                     <span key={size} className="text-xs text-gray-600">
//                                                         {size}
//                                                     </span>
//                                                 ))}
//                                             </div>
//                                         )}
//                                         <div className="flex justify-end mt-1">
//                                             <button className="text-gray-400 hover:text-gray-600 transition-colors">
//                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                                 </svg>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="border-t border-gray-200 p-4 space-y-4">
//                         <div className="flex items-center justify-between text-sm">
//                             <span className="text-gray-600 font-medium">EXCHANGE/RETURN POLICY</span>
//                             <span className="text-gray-400 text-lg font-bold hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">+</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <div className="text-lg font-semibold text-gray-900">$888</div>
//                                 <div className="text-xs text-gray-500">INCL.VAT</div>
//                             </div>
//                         </div>
//                         <div className="flex space-x-3">
//                             <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-900 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
//                                 CONTINUE SHOPPING
//                             </button>
//                             <button className="flex-1 py-3 px-4 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors">
//                                 CHECKOUT
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Desktop Modal */}
//             <div className="hidden md:block absolute inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
//                 <div className="flex flex-col h-full">
//                     {/* Header */}
//                     <div className="flex items-center justify-between p-6 border-b border-gray-200">
//                         <div className="flex items-center space-x-6">
//                             <span className="text-sm text-gray-500 font-medium">CART 02</span>
//                             <div className="flex space-x-4 text-sm">
//                                 <button className="text-black hover:underline font-medium">Clear all</button>
//                                 <button className="text-black hover:underline font-medium">Wishlist</button>
//                             </div>
//                         </div>
//                         <button
//                             onClick={onClose}
//                             className="text-black text-2xl font-bold hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
//                         >
//                             ×
//                         </button>
//                     </div>

//                     {/* Cart Items */}
//                     <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
//                         {cartData.items.map((item) => (
//                             <div key={item.id} className="flex space-x-4">
//                                 {/* Product Image */}
//                                 <div className="flex-shrink-0 w-24 h-32">
//                                     <img
//                                         src={item.product.image}
//                                         alt={item.product.name}
//                                         className="w-full h-full object-cover rounded"
//                                     />
//                                 </div>

//                                 {/* Product Details */}
//                                 <div className="flex-1 space-y-3">
//                                     <div className="text-sm font-semibold text-gray-900">
//                                         {item.product.brand}
//                                     </div>
//                                     <div className="text-sm text-gray-600">
//                                         {item.product.name}
//                                     </div>
//                                     <div className="text-sm font-semibold text-gray-900">
//                                         ${item.product.price}
//                                     </div>

//                                     {/* Size Selection */}
//                                     <div className="flex space-x-2">
//                                         {item.product.sizes.map((size) => (
//                                             <button
//                                                 key={size}
//                                                 onClick={() => handleSizeSelect(item.id, size)}
//                                                 className={`px-4 py-2 text-xs border rounded transition-colors ${selectedSizes[item.id] === size
//                                                     ? 'border-black bg-black text-white'
//                                                     : 'border-gray-300 text-gray-700 hover:border-gray-400'
//                                                     }`}
//                                             >
//                                                 {size}
//                                             </button>
//                                         ))}
//                                     </div>

//                                     {/* Quantity Control */}
//                                     <div className="flex items-center space-x-3">
//                                         <button
//                                             onClick={() => handleQuantityChange(item.id, -1)}
//                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
//                                         >
//                                             -
//                                         </button>
//                                         <span className="text-sm font-medium min-w-[20px] text-center">
//                                             {String(quantities[item.id] || 1).padStart(2, '0')}
//                                         </span>
//                                         <button
//                                             onClick={() => handleQuantityChange(item.id, 1)}
//                                             className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50"
//                                         >
//                                             +
//                                         </button>
//                                     </div>

//                                     {/* Color Selection */}
//                                     <div className="flex space-x-2">
//                                         {item.product.colors.map((color, index) => (
//                                             <button
//                                                 key={index}
//                                                 onClick={() => handleColorSelect(item.id, color)}
//                                                 className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColors[item.id]?.hex === color.hex
//                                                     ? 'border-black ring-2 ring-gray-200'
//                                                     : 'border-gray-300 hover:border-gray-400'
//                                                     }`}
//                                                 style={{ backgroundColor: color.hex }}
//                                             />
//                                         ))}
//                                     </div>

//                                     {/* Stock and Actions */}
//                                     <div className="text-xs text-amber-600 font-medium">{item.product.stock}</div>
//                                     <div className="text-xs text-gray-500">{item.product.deliveryTime}</div>

//                                     <div className="flex space-x-4 text-sm">
//                                         <button className="text-gray-600 hover:underline">Move to Wishlist</button>
//                                         <button className="text-gray-600 hover:underline">Delete</button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}

//                         {/* You May Also Like Section */}
//                         <div className="mt-8">
//                             <h3 className="text-sm font-semibold text-gray-900 mb-4">YOU MAY ALSO LIKE</h3>
//                             <div className="flex space-x-4 overflow-x-auto">
//                                 {cartData.recommendedItems.map((item) => (
//                                     <div key={item.id} className="flex-shrink-0 w-40">
//                                         <div className="relative">
//                                             <img
//                                                 src={item.product.image}
//                                                 alt={item.product.name}
//                                                 className="w-full h-40 object-cover rounded"
//                                             />
//                                             {/* Color dots on the right */}
//                                             <div className="absolute right-2 top-3 space-y-1">
//                                                 {item.product.colors.map((color, index) => (
//                                                     <div
//                                                         key={index}
//                                                         className="w-2 h-2 rounded-full border border-white"
//                                                         style={{ backgroundColor: color.hex }}
//                                                     />
//                                                 ))}
//                                             </div>
//                                         </div>
//                                         <button className="w-full mt-2 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded">
//                                             ADD TO CART
//                                         </button>
//                                         <div className="text-xs font-semibold text-gray-900 mt-1">
//                                             {item.product.brand}
//                                         </div>
//                                         <div className="text-xs text-gray-600">
//                                             {item.product.name}
//                                         </div>
//                                         <div className="text-xs text-gray-900">
//                                             ${item.product.price} ${item.product.originalPrice}
//                                         </div>
//                                         {item.product.sizes && (
//                                             <div className="flex space-x-1 mt-1">
//                                                 {item.product.sizes.map((size) => (
//                                                     <span key={size} className="text-xs text-gray-600">
//                                                         {size}
//                                                     </span>
//                                                 ))}
//                                             </div>
//                                         )}
//                                         <div className="flex justify-end mt-1">
//                                             <button className="text-gray-400">
//                                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//                                                 </svg>
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Footer */}
//                     <div className="border-t border-gray-200 p-6 space-y-4">
//                         <div className="flex items-center justify-between text-sm">
//                             <span className="text-gray-600 font-medium">EXCHANGE/RETURN POLICY</span>
//                             <span className="text-gray-400 text-lg font-bold hover:bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center cursor-pointer">+</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <div className="text-lg font-semibold text-gray-900">$888</div>
//                                 <div className="text-xs text-gray-500">INCL.VAT</div>
//                             </div>
//                         </div>
//                         <div className="flex space-x-3">
//                             <button className="flex-1 py-3 px-4 bg-gray-100 text-gray-900 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
//                                 CONTINUE SHOPPING
//                             </button>
//                             <button className="flex-1 py-3 px-4 bg-black text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors">
//                                 CHECKOUT
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CartModal;
