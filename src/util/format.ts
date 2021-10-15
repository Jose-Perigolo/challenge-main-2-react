export const { format: formatPrice } = new Intl.NumberFormat('pt-br', {
  style: 'currency',
  currency: 'BRL',
});

// export function formatPrice(price: number) {
//   return (
//     new Intl.NumberFormat('pt-br', {
//       style: 'currency',
//       currency: 'BRL',
//     }).format(price)
//   )
// }
