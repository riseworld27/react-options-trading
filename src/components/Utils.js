export const transformData = (data) => {
  return data.map(item => ({
    type: item.type,
    strikePrice: item.strike_price,
    premium: (item.bid + item.ask) / 2, // Using the midpoint of bid and ask as the premium
    quantity: item.long_short.toLowerCase() === 'long' ? 1 : -1 // Long is positive, short is negative
  }));
};

// Generate underlying prices around the given sample data's strike prices
export const generateUnderlyingPrices = (data) => {
  if (!data || data.length === 0) {
    return []; // Return empty array if contracts is not valid
  }

  const strikePrices = data.map(item => parseFloat(item.strikePrice));
  const minPrice = Math.min(...strikePrices) - 20;
  const maxPrice = Math.max(...strikePrices) + 20;
  const step = 5; // Step size for underlying prices
  const underlyingPrices = [];
  for (let price = minPrice; price <= maxPrice; price += step) {
    underlyingPrices.push(price);
  }
  return underlyingPrices;
};
