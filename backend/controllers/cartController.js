let cart = []; // temporary in-memory cart (later MongoDB use karna)

const getCart = (req, res) => {
  res.json({ success: true, cart });
};

const addToCart = (req, res) => {
  const item = req.body;

  cart.push(item);

  res.json({
    success: true,
    message: "Item added to cart",
    cart,
  });
};

const removeItem = (req, res) => {
  const { id } = req.body;

  cart = cart.filter((item) => item.id !== id);

  res.json({
    success: true,
    message: "Item removed",
    cart,
  });
};

const clearCart = (req, res) => {
  cart = [];

  res.json({
    success: true,
    message: "Cart cleared",
  });
};

module.exports = {
  getCart,
  addToCart,
  removeItem,
  clearCart,
};