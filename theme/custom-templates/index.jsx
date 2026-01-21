import Cart from "./cart";
import React from "react";
import { Route } from "react-router-dom";
import ProfileWishlist from "./profile-wishlist";
import ProfileExchange from "./profile-exchange";
import Journal from "./journal/journal";
import DeleteAccount from "./deleteAccount";

export default [
  <Route path="cart" element={<Cart></Cart>} />,
  // <Route path="profile" element={<Profile></Profile>} />,
  <Route path="journal" element={<Journal />} />,
  <Route path="wishlist" element={<ProfileWishlist></ProfileWishlist>} />,
  <Route
    path="profile/orders/exchange/:shipmentId"
    element={<ProfileExchange></ProfileExchange>}
  />,
  <Route path="delete-account" element={<DeleteAccount></DeleteAccount>} />,
];
