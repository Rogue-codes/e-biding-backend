export function genToken() {
  return (Math.floor(Math.random() * 900000) + 100000).toString();
}
